using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using System.Linq;

namespace ECommerceBackend.Controllers
{
    [Route("api/reviews")]
    [ApiController]
    public class GeneralReviewController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public GeneralReviewController(ECommerceContext context)
        {
            _context = context;
        }

        // Get all reviews of a particular product (No authorization required)
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviewsForProduct(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .Include(r => r.ProductReviews) 
                .ThenInclude(pr => pr.User)    
                .FirstOrDefaultAsync();

            if (reviews == null)
            {
                return Ok();
            }

            if(reviews.ProductReviews.Count == 0)
            {
                return Ok();
            }
            var reviewDetails = reviews.ProductReviews.Select(pr => new
            {
                pr.Id,
                pr.Content,
                pr.Rating,
                UserName = pr.User.Name
            });

            return Ok(reviewDetails);
        }
    }
}
