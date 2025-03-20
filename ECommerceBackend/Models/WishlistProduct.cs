using System.ComponentModel.DataAnnotations;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class WishlistProduct
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }
    }
}