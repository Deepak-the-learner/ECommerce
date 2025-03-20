using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace ECommerceBackend.Controllers
{
    [Route("api/cart")]
    [ApiController]
    [Authorize] 
    public class CartController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public CartController(ECommerceContext context)
        {
            _context = context;
        }

        // 1. Get Cart for the logged-in user
        [HttpGet]
        public async Task<ActionResult<Cart>> GetCart()
        {
            var userId = GetUserIdFromToken();

            var cart = await _context.Carts
                .Include(c => c.CartProducts)
                .ThenInclude(cp => cp.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound("Cart not found.");
            }
            var cartProducts = new List<CartReturn>();
            foreach(var items in cart.CartProducts)
            {
                cartProducts.Add(new CartReturn{
                    ProductName = items.Product.Name,
                    ProductId = items.ProductId,
                    Availability = items.Product.Availability,
                    ImageUrl = items.Product.ImageURL,
                    Quantity =  items.Quantity,
                    Price = items.Product.Price
                });
            }
            return Ok(cartProducts);
        }

        // 2. Add Product to Cart
        [HttpPost("{productId}")]
        public async Task<ActionResult> IncreaseQuantity(int productId)
        {
            var userId = GetUserIdFromToken();

            var cart = await _context.Carts.Include(c => c.CartProducts)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            
            var product = await _context.Products.FindAsync(productId);

            if (cart ==null || product == null)
            {
                return BadRequest("Invalid cart or product.");
            }

            var cartProduct = cart.CartProducts.FirstOrDefault(cp => cp.ProductId == productId);

            if (cartProduct == null)
            {
                if(product.Availability == 0)
                {
                    return BadRequest("No Stock Available");
                }
                cart.CartProducts.Add(new CartProduct
                {
                    ProductId = productId,
                    Quantity = 1,
                    Product = product 
                });
            }
            else
            {
                if(product.Availability < cartProduct.Quantity+1)
                {
                    return BadRequest("Cannot Add due to limited stock");
                }
                cartProduct.Quantity += 1;
            }

            await _context.SaveChangesAsync();

            return Ok();
        }


        // 3. Update Quantity in Cart
        [HttpPut("{productId}")]
        public async Task<ActionResult> DecreaseQuantity(int productId)
        {
            var userId = GetUserIdFromToken();

            var cart = await _context.Carts.Include(c => c.CartProducts)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if(product == null)
            {
                return NotFound("Product Not Found");
            }
            if (cart == null)
            {
                return NotFound("Cart not found.");
            }

            var cartProduct = cart.CartProducts.FirstOrDefault(cp => cp.ProductId == productId);

            if (cartProduct == null)
            {
                return NotFound("Product not found in cart.");
            }
            var quantity = cartProduct.Quantity-1;
            if(quantity == 0)
            {
                cart.CartProducts.Remove(cartProduct);   
            }else{
                cartProduct.Quantity = quantity;
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        // 4. Delete Product from Cart
        [HttpDelete("{productId}")]
        public async Task<ActionResult> DeleteProductFromCart(int productId)
        {
            var userId = GetUserIdFromToken();

            var cart = await _context.Carts.Include(c => c.CartProducts)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound("Cart not found.");
            }

            var cartProduct = cart.CartProducts.FirstOrDefault(cp => cp.ProductId == productId);

            if (cartProduct == null)
            {
                return NotFound("Product not found in cart.");
            }

            cart.CartProducts.Remove(cartProduct);

            await _context.SaveChangesAsync();

            return Ok();
        }

        // Helper method to extract the UserId from JWT token
        private int GetUserIdFromToken()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("User not logged in.");
            }
            return int.Parse(userIdClaim);
        }
    }

    public class AddProductToCartRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class CartReturn
    {
        public string ProductName{get;set;}
        public string ImageUrl{get;set;}
        public int Quantity{get;set;}
        public int ProductId{get;set;}
        public int Availability{get;set;}
        public decimal Price{get;set;}
        
    }
}
