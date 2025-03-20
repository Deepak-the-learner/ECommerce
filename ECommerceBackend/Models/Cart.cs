using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
        public List<CartProduct> CartProducts { get; set; } = new List<CartProduct>();
    }
}
