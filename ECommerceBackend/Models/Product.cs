using System.ComponentModel.DataAnnotations;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        [RegularExpression(@"^(Electronics|Beauty|Fashion|Home Essentials)$")]
        public string Category { get; set; } 
        public int Availability {get;set;}
        public string ImageURL {get;set;}

    }
}
