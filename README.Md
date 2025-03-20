# E-Commerce Platform (Backend: .NET, Frontend: React.js)

## 🚀 Instructions to Run the Project

### 📥 Download the Project

1. **Download the Zip File** and extract it.
2. You will find two folders:
   - **ECommerce-Backend** (Built with .NET Framework)
   - **ECommerce-Frontend** (Built with React.js)

---

## 🛠 Pre-Requisites

Ensure you have the following installed:

- [**.NET SDK**](https://dotnet.microsoft.com/download)
- [**Node.js**](https://nodejs.org/)
- [**SSMS (SQL Server Management Studio)**](https://aka.ms/ssmsfullsetup)

Now, install the global tool for Entity Framework:

```sh
 dotnet tool install --global dotnet-ef
```

---

## 🔧 Backend Setup (.NET Framework)

1. Open a **command prompt** and navigate to the `ECommerce-Backend` folder.
2. Install required NuGet packages (if not installed):

```sh
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Mvc
dotnet add package Microsoft.AspNetCore.Mvc.Core
```

3. Update **launchSettings.json** (Located in `Properties` folder):
   - Replace `localhost` placeholder with the actual host name.
4. Update **appsettings.json**:
   - Replace the **JWT key placeholder** with an actual secure key.
   - Configure the **SQL Server connection**:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=Your_Server_Name;Database=Your_Database_Name;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;"
     }
     ```

---

## 🗄 Database Setup (SQL Server)

1. Open **SSMS (SQL Server Management Studio)**.
2. Connect to the server using **Windows Authentication**.
3. Disable encryption (optional) and **trust the server certificate**.
4. Copy the **server name** from SSMS.
5. Paste the server name in `appsettings.json` under `Server=<your_server_name>`.
6. Define your desired database name in `Database=<your_database_name>`.

---

## 📦 Running Migrations

Run the following commands inside the `ECommerce-Backend` folder:

```sh
# Add a new migration (Replace <your_Migration_name> with your preferred name)
dotnet ef migrations add <your_Migration_name>

# Apply the migration and update the database
dotnet ef database update
```

If both steps are successful, start the backend server:

```sh
dotnet run
```

Now your **backend is running** on a specific host.

---

## 🌐 Frontend Setup (React.js)

1. Copy the backend URL where it is running.
2. Navigate to the `ECommerce-Frontend/src/utils` folder.
3. Open **api.js** and replace `<your_local_host>` with the copied backend URL.
4. Install dependencies:

```sh
npm install
```

5. Start the React application:

```sh
npm start
```

Now the React application should be up and running! 🎉

---

## 🎯 Summary

1. Setup **Backend** with .NET, configure settings, and run migrations.
2. Configure **SQL Server** connection and update `appsettings.json`.
3. Run the **backend server**.
4. Update **Frontend API config** and start the React app.

Congratulations! 🎉 Your **E-Commerce application** is now live. 🚀
