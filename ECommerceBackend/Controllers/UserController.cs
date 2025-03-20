using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using ECommerceBackend.Models;
using ECommerceBackend.Data;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBackend.Controllers
{
    [Route("api")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ECommerceContext _context;
        private readonly JwtSettings _jwtSettings; 
        private readonly double _jwtExpiryMinutes;

        public UserController(ECommerceContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _jwtExpiryMinutes = _jwtSettings.ExpiryMinutes;
        }

        // 1. Signup - Add user if first time (store password encrypted)
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] User user)
        {
            if (string.IsNullOrEmpty(user.Name) || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("All fields are required.");
            }

            var existingUser =  await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser != null)
            {
                return BadRequest("Credentails exists Please Login in");
            }

            user.Password = HashPassword(user.Password);
            user.isPremium = false; 

             await _context.Users.AddAsync(user);
             await _context.SaveChangesAsync();

            var cart = new Cart
            {
                UserId = user.Id,
                User = user 
            };
            var wishlist = new Wishlist
            {
                UserId = user.Id,
                User = user
            }; 
            var order = new Order
            {
                UserId = user.Id,
                User = user
            };
            await _context.Orders.AddAsync(order);
            await _context.Wishlists.AddAsync(wishlist);
            await _context.Carts.AddAsync(cart);
            await  _context.SaveChangesAsync();
            var token = GenerateJwtToken(user);
            return Ok(new { token = token, isPremium = user.isPremium, name=user.Name });
        }

        // 2. Login - Check email and password (password must be encrypted)
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            if(loginRequest == null)
            {
                return NotFound("No login device");
            }
            if(loginRequest.Email == null)
            {
                return NotFound("No Email");
            }
            if(loginRequest.Password == null)
            {
                return NotFound("No Password");
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

            if (user == null)
            {
                return BadRequest("Not an user Sign Up!");
            }
            if(!VerifyPassword(user.Password, loginRequest.Password))
            {
                return BadRequest("Invalid credentials.");
            }
            var token = GenerateJwtToken(user);
            return Ok(new { token = token, isPremium = user.isPremium, name=user.Name });
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hashed = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hashed);
            }
        }

        private bool VerifyPassword(string hashedPassword, string enteredPassword)
        {
            var hashedEnteredPassword = HashPassword(enteredPassword);
            return hashedPassword == hashedEnteredPassword;
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.isPremium ? "Premium" : "Regular"),
            };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: "ECommerceBackendUsers",
                claims: claims,
                expires: DateTime.Now.AddMinutes(_jwtExpiryMinutes),
                signingCredentials: credentials
            );

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.WriteToken(tokenDescriptor);
            return token;
        }
    }

    public class LoginRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}
