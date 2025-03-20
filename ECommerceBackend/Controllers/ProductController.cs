using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using System.Linq;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace ECommerceBackend.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public ProductController(ECommerceContext context)
        {
            _context = context;
        }

        // 1. Get all products
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
           var products = await _context.Products
                .Select(g => new
                {
                    Id = g.Id,
                    Name = g.Name,
                    Availability = g.Availability,
                    ImageUrl = g.ImageURL,
                    Category = g.Category,
                    Description = g.Description,
                    Price = g.Price,

                    // Fetch review data safely
                    AverageRating = _context.Reviews
                        .Where(r => r.ProductId == g.Id)
                        .SelectMany(r => r.ProductReviews)
                        .Any() 
                        ? _context.Reviews
                            .Where(r => r.ProductId == g.Id)
                            .SelectMany(r => r.ProductReviews)
                            .Average(pr => pr.Rating)
                        : 0,

                    NumberOfReviews = _context.Reviews
                        .Where(r => r.ProductId == g.Id)
                        .SelectMany(r => r.ProductReviews)
                        .Count()
                })
                .ToListAsync();
            return Ok(products);
            // var products = await _context.Products.ToListAsync();
            // return Ok(products);
        }

        // 2. Get product by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound("Product not found.");
            }

            return Ok(product);
        }

        // 3. Add a new product
        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid product.");
            }

            if(string.IsNullOrEmpty(product.Name) || string.IsNullOrWhiteSpace(product.Name) || 
            string.IsNullOrEmpty(product.Description) || string.IsNullOrWhiteSpace(product.Description) ||
            product.Price<=0 || product.Availability<=0)
            {
                return BadRequest("Invalid Details");
            }

            await _context.Products.AddAsync(product);
            await _context.SaveChangesAsync();
            Review review =  new Review{
                ProductId = product.Id,
                Product = product
            };
            await _context.Reviews.AddAsync(review);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        // 4. Update a product
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid product.");
            }

            if(string.IsNullOrEmpty(product.Name) || string.IsNullOrWhiteSpace(product.Name) || 
            string.IsNullOrEmpty(product.Description) || string.IsNullOrWhiteSpace(product.Description) ||
            product.Price<=0 || product.Availability<=0)
            {
                return BadRequest("Invalid Details");
            }
            var existingProduct = await _context.Products.FindAsync(id);
            if(existingProduct == null)
            {
                return NotFound("No Product Found");
            }
            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.Category = product.Category;
            existingProduct.Availability = product.Availability;
            existingProduct.ImageURL = product.ImageURL;
            existingProduct.Price = product.Price;

            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        // 5. Delete a product
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound("Product not found.");
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        // 6. Get Trending Products (Rating >= 4 and in descending order)
        [HttpGet("trending")]
        public async Task<ActionResult<IEnumerable<Product>>> GetTrendingProducts()
        {
            var highestRatedProducts = await _context.Reviews
                .Include(r => r.ProductReviews)
                .Include(r=>r.Product)
                .Select(g => new
                {
                    ProductId = g.ProductId,
                    AverageRating = g.ProductReviews
                                     .Average(pr => pr.Rating),
                    Product = g.Product
                })
                .Where(x => x.AverageRating >= 3.5) 
                .OrderByDescending(x => x.AverageRating) 
                .ToListAsync();
            
            
            var OrderedProducts = await _context.Orders
                .Include(o=>o.OrderProducts)
                .ThenInclude(op=>op.Product)
                .Select(o=>o.OrderProducts)
                .ToListAsync();
            
            Dictionary<int,int>frequency = new Dictionary<int, int>();

            DateTime oneWeekAgo = DateTime.UtcNow.AddDays(-7);

            decimal avgNumerator = 0;
            decimal avgDenominator = 0;

            foreach(var orderProduct in OrderedProducts)
            {
                foreach(var product in orderProduct)
                {
                    if(product == null)
                    {
                        continue;
                    }
                    if(product.Date >= oneWeekAgo)
                    {
                        if(frequency.ContainsKey(product.ProductId))
                        {
                            frequency[product.ProductId]+=product.Quantity;
                            avgNumerator+=product.Quantity;
                        }
                        else
                        {
                            frequency[product.ProductId] = product.Quantity;
                            avgNumerator+=product.Quantity;
                            avgDenominator+=1;
                        }
                    }
                }
            }

            decimal avg = avgNumerator/avgDenominator;

            var highestOrderedProducts = new List<int>();
            foreach(var productFrequency in frequency)
            {
                if(productFrequency.Value >= avg)
                {
                    highestOrderedProducts.Add(productFrequency.Key);
                }
            }

            var trendingProducts = new List<Product>();
            foreach(var product in highestRatedProducts)
            {
                if(highestOrderedProducts.Contains(product.ProductId))
                {
                    trendingProducts.Add(product.Product);
                }
            }

            return Ok(trendingProducts);
        }
    }
}
