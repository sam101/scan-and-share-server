scan-and-share-server
=====================

Server for Scan&amp;Share NF28 project

Node module Dependencies
============
* express
* mongoose
* tokauth


REST API spec
==============

GET
---
* /login?username=[username]&password=[password] (token exchange)
* /product?id=[ID] (product info + 10 first comments)
* /product?id=[ID]&commentsstartindex=[N] (10 more comments about the product)
* /product?name=[NAME]
* /product?type=[TYPE]
* /sales (get the first 10 sales)
* /sales?startindex=[N] (get the [N,N+10] sales)
* /sales?id=[EAN]

POST
----
* /register : {"username" : String,
               "password" : String,
                "email": String,
                "age" : double,
                "job" : String
              }
* /product?id=[ID] : {
                "name" : String,
                "price" : double,
                "gps": String,
                "description": String (optionnal),
                "rating": Double ([0,5]) (optionnal),
                "comment": {name: String, date: String, content: String} (optionnal),
                "types": String[] (optionnal),
                "photo": base64 (optionnal)
               }
               body example => "name=test&description=test&price=0.5&gps=35.2:16.3&comment[name]=toto&comment[date]=01/01/01&comment[content]=contenu&types=titi,tutu"
* /product?id=[]&comment&token=[TOKEN] {
                      "rating" : Double ([0,5]),
                      "comment": {name: String, date: String, content: String} (optionnal)
                     }
                     body example = > "rating=2&comment[date]=02/02/02&comment[content]=contenu 2"
* /product?id=[]&price {
                      "price": Double,
                      "gps": String
                   }
                   body example => "price=2.3&gps=21.2:34.3"
* /sales?id=[ID]&token=[TOKEN] : {
                     "price": double,
                     "description" : String,
                     "date": String                     
                   }
*                    
