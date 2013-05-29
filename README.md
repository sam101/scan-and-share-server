scan-and-share-server
=====================

Server for Scan&amp;Share NF28 project

REST API spec
==============

GET
---
* /login?username=[username]&password=[password] (token exchange)
* /ean?id=[ID] (product info + 10 first comments)
* /ean?id=[ID]&commentsstartindex=[N] (10 more comments about the product)
* /ean?name=[NAME]
* /ean?name=[NAME]&commentsstartindex=[N] (10 more comments about the product)
* /ean?type=[TYPE]
* /ean?type=[TYPE]&commentsstartindex=[N] (10 more comments about the product)
* /sales (get the first 10 sales)
* /sales?startindex=[N] (get the [N,N+10] sales)


POST
----
* /register : {"username" : String,
               "password" : String,
                "email": String,
                "age" : double,
                "job" : String
              }
* /ean?id=[ID] : {
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
* /ean?id=[]&comment {
                      "rating" : Double ([0,5]),
                      "comment": {name: String, date: String, content: String} (optionnal)
                     }
                     body example = > "rating=2&comment[name]=titi&comment[date]=02/02/02&comment[content]=contenu 2"
* /ean?id=[]&price {
                      "price": Double,
                      "gps": String
                   }
                   body example => "price=2.3&gps=21.2:34.3"
* /sales?id=[ID] : {
                     "price": double,
                     "description" : String
                   }
