using System.ComponentModel.DataAnnotations;
using ECommerceBackend.Models;
namespace ECommerceBackend.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public bool isPremium {get;set;} = false;
    }
}
