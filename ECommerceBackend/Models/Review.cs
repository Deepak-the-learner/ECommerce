using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; }
        public List<ProductReview> ProductReviews {get;set;} = new List<ProductReview>();
    }
}
