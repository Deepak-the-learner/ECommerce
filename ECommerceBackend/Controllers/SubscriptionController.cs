using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace ECommerceBackend.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize] 
    public class SubscriptionController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public SubscriptionController(ECommerceContext context)
        {
            _context = context;
        }

        // POST: api/subscription/subscribe
        [HttpPost("subscribe")]
        public async Task<IActionResult> SubscribeToPremium()
        {
            if(User.Identity == null)
            {
                return NotFound("No loggedin device");
            }
            if(User.Identity.Name == null)
            {
                return NotFound("No loggedin device");
            }

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if(userIdClaim == null)
            {
                return BadRequest("No User Found with this id");
            }
            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound("User not found" );
            }
            
            if (user.isPremium)
            {
                return BadRequest("User is already a premium member");
            }

            user.isPremium = true;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("User subscribed to premium successfully");
        }

        [HttpPost("unsubscribe")]
        public async Task<IActionResult> UnSubscribe()
        {
            if(User.Identity == null)
            {
                return NotFound("No loggedin device");
            }
            if(User.Identity.Name == null)
            {
                return NotFound("No loggedin device");
            }

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if(userIdClaim == null)
            {
                return BadRequest("No User Found with this id");
            }
            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                return NotFound("User not found" );
            }
            
            if (!user.isPremium)
            {
                return BadRequest("User is not a premium member");
            }

            user.isPremium = false;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("User unsubscribed");
        }
    }
}
