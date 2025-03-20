using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.OpenApi.Any;

namespace ECommerceBackend.Controllers
{
    [Route("api/orders")]
    [ApiController]
    [Authorize] 
    public class OrderController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public OrderController(ECommerceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var userId = GetUserIdFromToken(); 
            var orders = await _context.Orders
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .Where(o => o.UserId == userId)
                .Select(or=>new{or.Id,or.OrderProducts})
                .ToListAsync();

            if (orders == null)
            {
                return NotFound("No orders found.");
            }
            var ordersList = new List<OrderReturn>();
            foreach(var order in orders)
            {
                foreach(var product in order.OrderProducts)
                {
                    ordersList.Add(new OrderReturn{
                        ProductName = product.Product.Name,
                        ImageURL = product.Product.ImageURL,
                        Quantity = product.Quantity,
                        Date = product.Date
                    });
                }
            }
            return Ok(ordersList);
        }
        
        [HttpPost]
        public async Task<IActionResult> PlaceOrder()
        {
            var userId = GetUserIdFromToken();
            var cart = await _context.Carts
                .Include(c => c.CartProducts)
                .ThenInclude(cp => cp.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || cart.CartProducts.Count == 0)
            {
                return BadRequest("Your cart is empty. Add products before placing an order.");
            }

            var order = new Order
            {
                UserId = userId,
                OrderProducts = cart.CartProducts.Select(cp => new OrderProduct
                {
                    ProductId = cp.ProductId,
                    Quantity = cp.Quantity,
                    Product = cp.Product,
                    Date = DateTime.UtcNow
                }).ToList()
            };

            foreach (var cartProduct in cart.CartProducts)
            {
                var product = cartProduct.Product;
                if (product != null)
                {
                    if (product.Availability < cartProduct.Quantity && product.Availability != 0)
                    {
                        return BadRequest("Some of the Items in the cart are not available as per your Requirement");
                    }
                    if(product.Availability == 0)
                    {
                        return BadRequest("Some of the items in cart are out of stock");
                    }
                    product.Availability -= cartProduct.Quantity;
                }
            }
            await _context.Orders.AddAsync(order);
            cart.CartProducts.Clear(); 
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order placed successfully."});
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

    public class OrderReturn
    {
        public string ProductName{get;set;}
        public int Quantity{get;set;}
        public string ImageURL{get;set;}
        public DateTime Date{get;set;}

    }
}
