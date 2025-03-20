using System.ComponentModel.DataAnnotations;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class OrderProduct
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; } 
        public int Quantity {get;set;}
    }
}
