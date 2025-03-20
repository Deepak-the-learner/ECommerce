using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class ProductReview
    {
        [Key]
        public int Id { get; set; }
        public string? Content { get; set; }
        [Required]
        public double Rating { get; set; } 
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
