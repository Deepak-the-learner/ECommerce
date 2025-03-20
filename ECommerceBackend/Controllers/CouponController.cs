using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ECommerceBackend.Data;
using ECommerceBackend.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ECommerceBackend.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize] // Ensure the user is authenticated
    public class CouponsController : ControllerBase
    {
        private readonly ECommerceContext _context;

        public CouponsController(ECommerceContext context)
        {
            _context = context;
        }

        // GET: api/coupons
        [HttpGet("coupons/{cartValue}")]
        public async Task<IActionResult> GetCoupons(decimal cartValue)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            if(userId == null)
            {
                return BadRequest("No User Found");
            }
            var userid = int.Parse(userId);
            var user = await _context.Users.FindAsync(userid);
            
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            if (!user.isPremium)
            {
                return BadRequest(new { Message = "Only premium users can access coupons." });
            }

            var coupons = await _context.Coupons.ToListAsync();
            var eligibleCoupons = new List<Coupon>();
            var ineligibleCoupons = new List<Coupon>();
            foreach(var coupon in coupons)
            {
                if(cartValue >= coupon.MinimumCartValue)
                {
                    eligibleCoupons.Add(coupon);
                }
                else
                {
                    ineligibleCoupons.Add(coupon);
                }
            }

            
            eligibleCoupons = eligibleCoupons.OrderBy(ec=>computeTotalValue(ec,cartValue)).ToList();

            ineligibleCoupons = ineligibleCoupons.OrderBy(iec=>iec.MinimumCartValue).ToList();

            Coupon bestCoupon = eligibleCoupons.Count == 0 ? new Coupon() : eligibleCoupons.ElementAt(0);
            return Ok(new{bestCoupon = bestCoupon,eligibleCoupons=eligibleCoupons,ineligibleCoupons=ineligibleCoupons});
        }

        private decimal computeTotalValue(Coupon coupon,decimal cartValue)
        {
            decimal res = Math.Max(cartValue-cartValue*(decimal)(coupon.DiscountPercent/100),cartValue-(decimal)coupon.MaximumDiscountAmount);
            return res;
        }
    }

}
