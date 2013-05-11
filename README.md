scan-and-share-server
=====================

Server for Scan&amp;Share NF28 project

REST API spec
==============

GET
---
* /login (token exchange)
* /ean?id=[ID] (product info + 10 first comments)
* /ean?id=[ID]&comments&startIndex=[N] (10 more comments about the product)
* /sales (get the first 10 sales)
* /sales?startIndex=[N] (get the [N,N+10] sales)


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
                "GPS": String,
                "description": String (optionnal),
                "rating": Integer ([0,5]) (optionnal),
                "comment": String (optionnal),
                "types": String[] (optionnal),
                "photo": base64 (optionnal)
               }
* /ean?id=[]&comment {
                      "rating" : Integer ([0,5]),
                      "comment": String (optionnal)
                     }
* /ean?id=[]&price {
                      "price": Double,
                      "GPS": String
                   }

* /sales?id=[ID] : { "price": double,
                     "description" : String
                   } 
