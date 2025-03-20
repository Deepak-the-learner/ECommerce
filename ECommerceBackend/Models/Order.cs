using System.ComponentModel.DataAnnotations;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public List<OrderProduct> OrderProducts {get;set;} = new List<OrderProduct>();
    }
}
