using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;
using System.Runtime.CompilerServices;

namespace ECommerceBackend.Controllers
{
    [Route("api/reviews")]
    [ApiController]
    [Authorize]  
    public class UserReviewController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public UserReviewController(ECommerceContext context)
        {
            _context = context;
        }

        [HttpPost("product/{productId}")]
        public async Task<IActionResult> AddReview(int productId, [FromBody] ProductReviewRequest request)
        {
            var userId = GetUserIdFromToken(); 

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null)
            {
                return NotFound("Product not found.");
            }

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ProductId == productId);

            if (review == null)
            {
                review = new Review { ProductId = productId, Product = product };
                await _context.Reviews.AddAsync(review);
                await _context.SaveChangesAsync();
            }
            var user = await _context.Users.FindAsync(userId);
            if(user == null)
            {
                return NotFound("User Not Found");
            }
            var productReview = new ProductReview
            {
                Content = request.Content,
                Rating = request.Rating,
                UserId = userId,
                User = user
            };

            review.ProductReviews.Add(productReview); 
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Review added successfully" });
        }

        [HttpGet("product/{productId}/review/{reviewId}")]
        public async Task<IActionResult> GetReviewByIds(int productId, int reviewId)
        {
            var userId = GetUserIdFromToken(); 

            var productReview = await _context.Reviews
                .Include(p=>p.ProductReviews)
                .Where(pr => pr.ProductId == productId) 
                .FirstOrDefaultAsync();

            if (productReview == null)
            {
                return NotFound("Review Not Found");
            }

            var review = productReview.ProductReviews.Find(r=>r.UserId == userId && r.Id == reviewId);
            if(review == null)
            {
                return Unauthorized("You can only update your own reviews.");
            }
            return Ok(review);
        }

        [HttpPut("product/{productId}/review/{reviewId}")]
        public async Task<IActionResult> UpdateReview(int productId, int reviewId, [FromBody] ProductReviewRequest request)
        {
            var userId = GetUserIdFromToken(); 

            var productReview = await _context.Reviews
                .Include(p=>p.ProductReviews)
                .Where(pr => pr.ProductId == productId) 
                .FirstOrDefaultAsync();

            if (productReview == null)
            {
                return NotFound("Review Not Found");
            }

            var review = productReview.ProductReviews.Find(r=>r.UserId == userId && r.Id == reviewId);
            if(review == null)
            {
                return Unauthorized("You can only update your own reviews.");
            }
            review.Content = request.Content;
            review.Rating = request.Rating;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("Userproduct/{productId}")]
        public async Task<IActionResult> GetReviewsByUser(int productId)
        {
            var userId = GetUserIdFromToken();
            var productReview = await _context.Reviews
                .Include(p=>p.ProductReviews)
                .Where(pr => pr.ProductId == productId)
                .FirstOrDefaultAsync();
            if (productReview == null)
            {
                return Ok();
            }
            var review = productReview.ProductReviews.Where(pr=>pr.UserId == userId).Select(p=>p.Id).ToList();
            return Ok(review);
        }


        [HttpDelete("product/{productId}/review/{reviewId}")]
        public async Task<IActionResult> DeleteReview(int productId, int reviewId)
        {
            var userId = GetUserIdFromToken(); 

            var productReview = await _context.Reviews
                .Include(p=>p.ProductReviews)
                .Where(pr=>pr.ProductId == productId) 
                .FirstOrDefaultAsync();

            if (productReview == null)
            {
                return Unauthorized("You can only delete your own reviews.");
            }
            var review = productReview.ProductReviews.FindAll(r=>r.UserId == userId).Find(r=>r.Id == reviewId);
            if(review == null)
            {
                return NotFound("Review Not Found");
            }
            productReview.ProductReviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok();
        }

        private int GetUserIdFromToken()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException("User ID not found in the token.");
            }
            return int.Parse(userIdClaim);
        }
    }

    public class ProductReviewRequest
    {
        public string? Content { get; set; }
        public double Rating { get; set; }
    }
}
