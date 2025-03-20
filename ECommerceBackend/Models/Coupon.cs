using System.ComponentModel.DataAnnotations;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class Coupon
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string CouponCode { get; set; } 
        [Required]
        [Range(0,100)]
        public double DiscountPercent { get; set; }  
        [Required]
        public decimal MinimumCartValue { get; set; }  
        [Required]
        public decimal MaximumDiscountAmount { get; set; }  
    }
}
