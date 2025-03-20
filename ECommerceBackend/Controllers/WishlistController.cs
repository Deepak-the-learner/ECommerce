using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Threading.Tasks;

namespace ECommerceBackend.Controllers
{
    [Route("api/wishlists")]
    [ApiController]
    [Authorize] 
    public class WishlistController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public WishlistController(ECommerceContext context)
        {
            _context = context;
        }

        // 1. Get Wishlist for the logged-in user
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetUserIdFromToken();

            var wishlist = await _context.Wishlists
                .Include(w => w.WishlistProducts)
                .ThenInclude(wp => wp.Product)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist == null)
            {
                return NotFound("Wishlist not found.");
            }
            var wishProducts = new List<WishListReturn>();
            foreach(var product in wishlist.WishlistProducts)
            {
                wishProducts.Add(new WishListReturn{
                    ProductName = product.Product.Name,
                    ImageURL = product.Product.ImageURL,
                    Price = product.Product.Price,
                    ProductId = product.ProductId
                });
            }
            return Ok(wishProducts);
        }

        // 2. Add Product to Wishlist
        [HttpPost("{productId}")]
        public async Task<IActionResult> AddProductToWishlist(int productId)
        {
            var userId = GetUserIdFromToken();

            var wishlist = await _context.Wishlists.Include(w => w.WishlistProducts)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            var product = await _context.Products.FindAsync(productId);

            if (wishlist == null || product == null)
            {
                return BadRequest("Invalid wishlist or product.");
            }

            var wishlistProduct = wishlist.WishlistProducts.FirstOrDefault(wp => wp.ProductId == productId);

            if (wishlistProduct == null)
            {
                wishlist.WishlistProducts.Add(new WishlistProduct
                {
                    ProductId = productId,
                    Product = product
                });
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        // 3. Delete Product from Wishlist
        [HttpDelete("{productId}")]
        public async Task<IActionResult> DeleteProductFromWishlist(int productId)
        {
            var userId = GetUserIdFromToken();

            var wishlist = await _context.Wishlists.Include(w => w.WishlistProducts)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist == null)
            {
                return NotFound("Wishlist not found.");
            }

            var wishlistProduct = wishlist.WishlistProducts.FirstOrDefault(wp => wp.ProductId == productId);

            if (wishlistProduct == null)
            {
                return NotFound("Product not found in wishlist.");
            }

            wishlist.WishlistProducts.Remove(wishlistProduct);

            await _context.SaveChangesAsync();

            return Ok();
        }

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

    public class AddProductToWishlistRequest
    {
        public int ProductId { get; set; }
    }
    public class WishListReturn
    {
        public int ProductId{get;set;}
        public string ProductName{get;set;}
        public decimal Price{get;set;}
        public string ImageURL{get;set;}
    }
}
