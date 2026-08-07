CREATE DATABASE  IF NOT EXISTS `e_commerce` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `e_commerce`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: e_commerce
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  KEY `cart_product_id_idx` (`product_id`),
  CONSTRAINT `cart_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `categoriescol_UNIQUE` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Gaming Consoles','Gaming Consoles'),(2,'Games','Games'),(3,'Gaming Accessories','Gaming Accessories'),(4,'Gaming Setup','Gaming Setup');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jwt_tokens`
--

DROP TABLE IF EXISTS `jwt_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jwt_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`token_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwt_tokens`
--

LOCK TABLES `jwt_tokens` WRITE;
/*!40000 ALTER TABLE `jwt_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `jwt_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(255) NOT NULL,
  `product_id` int NOT NULL,
  `order_itemscol` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `items_product_id_idx` (`product_id`),
  KEY `items_order_id_idx` (`order_id`),
  CONSTRAINT `items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,'132fddf4-01ab-477d-9366-57a3a379cda3',102,'PS5 Pro',1,1.00,1.00),(2,'87cae1a1-a09a-4309-9f93-9851914a2bbd',103,'Steam Deck',1,1.00,1.00),(3,'487d53a7-c288-44d5-951f-32a7419e1397',102,'PS5 Pro',1,1.00,1.00),(4,'d4e02609-b433-46d3-a41a-fb824a898288',104,'PS5 Spidey Edition',1,1.00,1.00),(5,'91116952-2cc5-4efa-9e67-1f929466a24d',104,'PS5 Spidey Edition',1,1.00,1.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_id` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_id` timestamp NULL DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `ord_user_id_idx` (`user_id`),
  CONSTRAINT `ord_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('132fddf4-01ab-477d-9366-57a3a379cda3',1,1.00,'SUCCESS','2026-08-04 16:29:08',NULL,NULL,NULL),('487d53a7-c288-44d5-951f-32a7419e1397',1,1.00,'SUCCESS','2026-08-04 17:08:27','2026-08-04 17:13:50','order_TLlmHtyE3ewxED','pay_TLlrYpA8124bzx'),('87cae1a1-a09a-4309-9f93-9851914a2bbd',1,1.00,'SUCCESS','2026-08-04 16:42:53',NULL,NULL,NULL),('91116952-2cc5-4efa-9e67-1f929466a24d',1,1.00,'SUCCESS','2026-08-04 17:14:48','2026-08-04 17:15:12','order_TLlswCxIY1T82R','pay_TLlt698o5MJAHf'),('d4e02609-b433-46d3-a41a-fb824a898288',1,1.00,'PENDING','2026-08-04 17:14:19',NULL,'order_TLlsRWywavpBUn',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productimages`
--

DROP TABLE IF EXISTS `productimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productimages` (
  `images_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `image_url` text NOT NULL,
  PRIMARY KEY (`images_id`),
  KEY `product_id_idx` (`product_id`),
  CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productimages`
--

LOCK TABLES `productimages` WRITE;
/*!40000 ALTER TABLE `productimages` DISABLE KEYS */;
INSERT INTO `productimages` VALUES (1,101,'https://ik.imagekit.io/stringstackSG/Consoles/Xbox%20VR.webp?updatedAt=1785152019525'),(2,102,'https://ik.imagekit.io/stringstackSG/Consoles/PS5%20pro.webp?updatedAt=1785152019514'),(3,103,'https://ik.imagekit.io/stringstackSG/Consoles/steam%20deck.jpg?updatedAt=1785152019425'),(4,104,'https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Spidey%20edition.jpg?updatedAt=1785152019417'),(5,105,'https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Slim.webp?updatedAt=1785152019515'),(6,106,'https://ik.imagekit.io/stringstackSG/Consoles/AYA%20NEO%202S.jpg?updatedAt=1785152019431'),(7,107,'https://ik.imagekit.io/stringstackSG/Consoles/rog%20ally.jpg?updatedAt=1785152019404'),(8,108,'https://ik.imagekit.io/stringstackSG/Consoles/xbox%20series%20S.webp?updatedAt=1785152019482'),(9,109,'https://ik.imagekit.io/stringstackSG/Consoles/xbox.webp?updatedAt=1785152019417'),(10,110,'https://ik.imagekit.io/stringstackSG/Consoles/PS5%20Gold%20Edition.jpg?updatedAt=1785152019181'),(11,111,'https://ik.imagekit.io/stringstackSG/Consoles/PS%20portal.jpg?updatedAt=1785152019169'),(12,112,'https://ik.imagekit.io/stringstackSG/Consoles/nintendo%20switch%202.jpg?updatedAt=1785152019003'),(13,113,'https://ik.imagekit.io/stringstackSG/Consoles/nintendo%20switch%201.png?updatedAt=1785152018953'),(14,114,'https://ik.imagekit.io/stringstackSG/Consoles/MSI%20claw.jpg?updatedAt=1785152018875'),(15,115,'https://ik.imagekit.io/stringstackSG/Consoles/AYA%20NEO%20Air%20plus.jpg?updatedAt=1785152018827'),(16,201,'https://ik.imagekit.io/stringstackSG/Games/SONY%20The%20Last%20Of%20Us%20Part%201%20For%20PS5%20(Action-Adventure%20Game,%2050668583,%20Standard%20Edition).webp?updatedAt=1785148697115'),(17,202,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Rise%20Of%20The%20Ronin.webp?updatedAt=1785148697040'),(18,203,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Grand%20Theft%20Auto%20V%20|%20Rockstar%20Games%20|%20GTA%20V.webp?updatedAt=1785148697002'),(19,204,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Red%20Dead%20Redemption.webp?updatedAt=1785148696984'),(20,205,'https://ik.imagekit.io/stringstackSG/Games/SONY%20The%20Last%20of%20Us%20Part%202%20Remastered%20For%20PS5%20(Action-Adventure%20Games,%20PPSA-15508).webp?updatedAt=1785148697000'),(21,206,'https://ik.imagekit.io/stringstackSG/Games/SONY%20God%20Of%20War%20Ragnarok%20For%20PS5%20(Action%20Games,%20Standard%20Edition,%2050668668).webp?updatedAt=1785148696950'),(22,207,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Gran%20Turismo%207%20Standard%20Edition.webp?updatedAt=1785148696990'),(23,208,'https://ik.imagekit.io/stringstackSG/Games/SONY%20Spiderman%202%20For%20PS5%20(Action-Adventure%20Games,%20Standard%20Edition,%2050668584).webp?updatedAt=1785148696924'),(24,209,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Marvel\'s%20Wolverine.webp?updatedAt=1785148696854'),(25,210,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20EA%20SPORTS%20FC%2026%20Standard%20Edition.webp?updatedAt=1785148696995'),(26,211,'https://ik.imagekit.io/stringstackSG/Games/PS5%C2%AE%20Grand%20Theft%20Auto%20VI%20|%20Rockstar%20Games%20|%20GTA%206%20Standard%20Edition.webp?updatedAt=1785148696820'),(27,212,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Game%20Software%20Assassin\'s%20Creed%20Valhalla.webp?updatedAt=1785148696812'),(28,213,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%C2%AE%20Game%20Software%20Uncharted%20Legacy%20of%20Thieves%20Collection.webp?updatedAt=1785148696868'),(29,214,'https://ik.imagekit.io/stringstackSG/Games/SONY%20Death%20Stranding%202%20On%20The%20Beach%20For%20PS5%20(Action-Adventure%20Games,%20PPSA-02015).webp?updatedAt=1785148696855'),(30,215,'https://ik.imagekit.io/stringstackSG/Games/Sony%20PS5%20Demon%20Souls.webp?updatedAt=1785148696798'),(31,301,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/PS5%20Vertical%20Stand.jpg?updatedAt=1785152753606'),(32,302,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/Seagate%20Storage%20Expansion%20Card.jpg?updatedAt=1785152753596'),(33,303,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/WD%20Black%20SN850P%20SSD%20(PS5).jpg?updatedAt=1785152753614'),(34,304,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/ps5%20spidey%20edition.jpg?updatedAt=1785152753545'),(35,305,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/Xbox%20Wireless%20Controller.avif?updatedAt=1785152753631'),(36,306,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/HD%20Camera%20for%20PS5.webp?updatedAt=1785152753604'),(37,307,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/ps5%20gold%20edition.webp?updatedAt=1785152753480'),(38,308,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/Nintendo%20Switch%20Pro%20Controller.avif?updatedAt=1785152753551'),(39,309,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/PlayStation%20Media%20Remote.webp?updatedAt=1785152753422'),(40,310,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/KontrolFreek%20Performance%20Thumbsticks.jpg?updatedAt=1785152753292'),(41,311,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/PlayStation%20Access%20Controller.jpg?updatedAt=1785152753119'),(42,312,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/DualSense%20Charging%20Station.avif?updatedAt=1785152753304'),(43,313,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/joy-Con%20Controllers%20(Neon).webp?updatedAt=1785152753258'),(44,314,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/DualSense%20Wireless%20Controller.webp?updatedAt=1785152753227'),(45,315,'https://ik.imagekit.io/stringstackSG/Console%20Accessories/Joy-Con%20Charging%20Grip.jpg?updatedAt=1785152753070'),(46,401,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/One%20Piece%20King%20of%20Artist%20The%20Monkey.%20D.%20Luffy%20One%20Piece%20Monkey%20D.%20Luffy%20King%20of%20Artist%20Figure%20Prize%20Banpresto.jpg?updatedAt=1785177280405'),(47,402,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/ARTFX%20J%20Demon%20Slayer%20Uzui%20Tengen%201:8%20Scale%20PVC%20Pre-Painted%20Complete%20Figure%20PV041.jpg?updatedAt=1785177280339'),(48,403,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Marvel%20Spider-Man%20Titan%20Hero%20Series%20Ultimate%20Spiderman(Miles%20Morales)%20Figure.jpg?updatedAt=1785177280094'),(49,404,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Anime%20Figures%20Cartoon%20Character%20Cute%20Model%20Collectable%20Figure%20Birthday%20Creative%20Gift.jpg?updatedAt=1785177279863'),(50,405,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Bestier%2051%20L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlets,%20LED%20Workstation%20with%204%20Tiers%20Shelves,%20Carbon%20Fiber%20White.png?updatedAt=1785176703281'),(51,406,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Eivanet%2053inch%20L%20Shaped%20Desk,L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlets%20&%20LED%20Lights,%20Computer%20Desk%20with%20Monitor%20Stand%20&%20Storage%20Bag,%20Home%20Office%20Desk%20Corner%20Desk%20with%20Hooks,Carbon%20Fiber%20Black.jpg?updatedAt=1785176701840'),(52,407,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/FIFINE%20Gaming%20Dynamic%20Mic%20Bundle-%20XLR:USB%20Mic%20Kit%20with%20RGB%20Boom%20Arm,3%20EQ%20Audio%20Mixer%20with%20Voice%20Changer%20and%2010ft%20XLR%20Cable%20for%20Streaming:Podcast:Game%20Voice%20(AM8PROT+SC8+L9).jpg?updatedAt=1785176701750'),(53,408,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Eivanet%20L%20Shaped%20Gaming%20Desk%20with%20Power%20Outlet%20&%20Led%20Light,%2047%20inch%20Reversible%20Computer%20Desk%20with%20Shelves,%20Hooks,%20and%20Drawer,%20Cornor%20Home%20Office%20Desk%20Table%20for%20Living%20Room,%20Bedroom,%20Black%20.jpg?updatedAt=1785176701790'),(54,409,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/L-Shaped%20Gaming%20Desk,%20Large%20Standing%20Desk,%20Study%20&%20Office%20Table,%20Sturdy%20Legs%20and%20Smooth%20Edges,%20Corner%20Computer%20Desk%20with%20Storage%20Shelves%20-%20Perfect%20for%20Bedroom%20and%20Office,%20Black%20Left,%2047.2%20x.jpg?updatedAt=1785176701732'),(55,410,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Gaming%20Chair%20Racing%20Ergonomic%20Racing%20Chair%20High%20Back%20PC%20Computer%20Gaming%20Chairs%20with%20Headrest%20Lumbar%20Support%20&%20Flip-up%20Arms%20PU%20Leather%20Adjustable%20Height%20Swivel,%20Pink.jpg?updatedAt=1785176701763'),(56,411,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Kosker%20Headset%20Stand%203%20Tiers%20for%20Desk,%20Rotatable%20Gaming%20Controller%20Stand%20for%20PS5:PS4:Xbox:Switch2:PS%20Portal:Phone,%20Universal%20PC%20Gamer%20Gift%20Accessory%20Controller:Headphone%20Holder%20for%209%20Packs%20Controller.jpg?updatedAt=1785176701662'),(57,412,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/GTPLAYER%20Gaming%20Chair%20with%20Speakers,%20Video%20Game%20Chairs%20with%20Footrest,%20PC%20Gamer%20Chairs%20for%20Adults%20-%20Padded%20High%20Back%20Ergonomic%20Reclining%20Silla%20Gamer,%20Linkage%20Armrest,%20Ace%20Pro,%20Blue%20(Velvet).jpg?updatedAt=1785176701597'),(58,413,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/GTPLAYER%20Big%20and%20Tall%20Gaming%20Chair%20Ergonomic%20Heavy%20Duty%20Office%20Chair%20Racing%20Seat%20with%20Adjustable%20Lumbar%20Pillow%20Footrest%20150%20Reclining%20Thickened%20Armrests%20Breathable%20Mesh%20for%20Esports:PC%20Gaming%20.jpg?updatedAt=1785176701605'),(59,414,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Massage%20Gaming%20Chair%20with%20LED%20Light,Gaming%20Chair%20Massage%20with%20Speakers,with%20Retractable%20Footrest%20Ergonomic%20High%20Back%20PU%20Swivel%20Reclining%20Gaming%20Chair%20for%20Teens,Black.jpg?updatedAt=1785176701445'),(60,415,'https://ik.imagekit.io/stringstackSG/Gaming%20Setup/Massage%20Gaming%20Chair%20with%20LED%20Light,Gaming%20Chair%20Massage%20with%20Speakers,with%20Retractable%20Footrest%20Ergonomic%20High%20Back%20PU%20Swivel%20Reclining%20Gaming%20Chair%20for%20Teens,Black.jpg?updatedAt=1785176701445');
/*!40000 ALTER TABLE `productimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image` varchar(255) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `category_id_idx` (`category_id`),
  CONSTRAINT `category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=416 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (101,'Xbox VR','Next-generation immersive virtual reality headset designed for Xbox. Features dual 4K OLED displays, ultra-precise spatial tracking, and ergonomic headstraps for long gaming sessions.',39990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(102,'PS5 Pro','Experience ultra-high definition gaming with enhanced GPU performance and advanced ray tracing. Comes with 2TB high-speed SSD storage and supports up to 120 FPS at 4K resolution.',69990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(103,'Steam Deck','Powerful portable PC gaming handheld powered by a custom AMD APU. Play your full Steam library on the go with a vibrant 7-inch touchscreen and customizable trackpads.',49990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(104,'PS5 Spidey Edition','Limited edition Marvel Spider-Man 2 PlayStation 5 console bundle. Features custom symbiote takeover side plates and a matching DualSense wireless controller.',59990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(105,'PS5 Slim','Sleek and compact design delivering the full power of PlayStation 5. Includes 1TB ultra-fast SSD, ray tracing technology, and 3D Audio support.',44990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(106,'AYA NEO 2S','Premium handheld gaming PC equipped with AMD Ryzen 7 7840U processor. Features a borderless 7-inch HD screen and ergonomic grips for desktop-class performance anywhere.',79990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(107,'ROG Ally','High-performance Windows 11 handheld console powered by AMD Z1 Extreme chip. Enjoy full 1080p 120Hz smooth gameplay across Game Pass, Steam, and Epic Games.',59990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(108,'Xbox Series S','All-digital next-gen console offering fast load times and up to 120 FPS gameplay. Compact white design with 512GB NVMe SSD and Xbox Velocity Architecture.',31990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(109,'Xbox','The fastest and most powerful Xbox ever built with 12 teraflops of graphics processing power. Supports true 4K gaming, 8K HDR readiness, and 1TB custom SSD.',52990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(110,'PS5 Gold Edition','Collector luxury PlayStation 5 console featuring custom gold accents and premium housing. Includes two gold-themed DualSense wireless controllers and exclusive stand.',99990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(111,'PS Portal','Dedicated Remote Play handheld device for streaming your PS5 games over Wi-Fi. Features an 8-inch 1080p 60fps LCD screen with full DualSense haptic feedback controls.',18990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(112,'Nintendo Switch 2','Next-gen hybrid gaming console with enhanced graphics and magnetic Joy-Con controllers. Play seamlessly in handheld mode or dock to your TV for full 4K output.',34990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(113,'Nintendo Switch 1','Hybrid console featuring a vibrant 7-inch OLED screen, wide adjustable stand, and enhanced audio. Enjoy gaming anywhere in handheld, tabletop, or TV mode.',29990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(114,'MSI Claw','Advanced handheld gaming device powered by Intel Core Ultra processor with XeSS graphics. Features ergonomic design, RGB analog sticks, and long-lasting 53Wh battery.',64990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(115,'AYA NEO Air Plus','Ultra-compact and lightweight PC gaming handheld designed for comfortable portability. Outfitted with high-contrast screen, responsive hall-effect triggers, and fast cooling.',44990.00,1,1,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(201,'SONY The Last Of Us Part 1 For PS5','Rebuilt from the ground up for PS5. Experience the emotional storytelling and unforgettable characters of Joel and Ellie in stunning 4K visuals with haptic feedback.',3999.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(202,'Sony PS5 Rise Of The Ronin','Embark on an epic journey across 19th-century war-torn Japan in this open-world action RPG. Master versatile combat styles with katana and firearms to shape history.',4499.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(203,'Sony PS5 Grand Theft Auto V','Experience the blockbuster open-world action in Los Santos with enhanced 4K visuals and faster loading times. Includes GTA Online with all expansion content.',2499.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(204,'Sony PS5 Red Dead Redemption','Relive Arthur Morgan epic tale across the American heartland. Features remastered high-definition graphics, improved framerates, and the Undead Nightmare expansion.',3299.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(205,'SONY The Last of Us Part 2 Remastered For PS5','Enhanced native PS5 edition featuring No Return roguelike survival mode, Lost Levels, and graphical upgrades. Follow Ellie and Abby in a gripping tale of revenge.',3499.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(206,'SONY God Of War Ragnarok For PS5','Journey across the Nine Realms with Kratos and Atreus as Asgardian forces prepare for battle. Features thrilling combat, epic boss fights, and breathtaking visuals.',4499.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(207,'Sony PS5 Gran Turismo 7 Standard Edition','The real driving simulator brought to life with over 400 cars and dynamic weather physics. Supports PS VR2 and immersive DualSense haptic feedback.',3999.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(208,'SONY Spiderman 2 For PS5','Swing through Marvel New York as both Peter Parker and Miles Morales. Battle iconic villains like Venom and Kraven using new web wings and symbiote powers.',4499.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(209,'Sony PS5 Marvel\'s Wolverine','Play as the legendary X-Men member Wolverine in an intense, mature action-adventure game. Features visceral Adamantium claw combat and a gripping original storyline.',4999.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(210,'Sony PS5® EA SPORTS FC 26 Standard Edition.webp','The world game featuring unmatched realism, HyperMotionV technology, and updated rosters. Build your dream squad in Ultimate Team or manage clubs to glory.',4499.00,1,2,'2026-07-28 06:30:55','2026-08-04 14:17:23',NULL,NULL),(211,'PS5 Grand Theft Auto VI','Step into the state of Leonida in the most immersive Grand Theft Auto experience ever. Follow Lucia and Jason in a massive dynamic open world with groundbreaking detail.',5999.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(212,'Sony PS5 Assassin\'s Creed Valhalla','Become Eivor, a legendary Viking warrior on a quest for glory. Raid Saxon fortresses, dual-wield powerful weapons, and grow your settlement in dark-age England.',2999.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(213,'Sony PS5 Uncharted Legacy of Thieves Collection','Seek your fortune in remastered adventures featuring Nathan Drake and Chloe Frazer. Includes Uncharted 4: A Thief End and Uncharted: The Lost Legacy.',2999.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(214,'SONY Death Stranding 2 On The Beach For PS5','Hideo Kojima visionary sci-fi sequel. Reconnect a fractured world with new environments, advanced tactical gear, and a captivating star-studded narrative.',4999.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(215,'Sony PS5 Demon Souls','Entirely rebuilt from the ground up, experience the dark fantasy classic that started the genre. Master brutal melee combat with stunning ray-traced graphics.',3499.00,1,2,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(301,'PS5 Vertical Stand','Official vertical stand designed to securely hold both PS5 Disc and Digital Edition models. Sturdy metallic base with anti-slip rubber pads for maximum stability.',2490.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(302,'Seagate Storage Expansion Card','Official 1TB NVMe expansion card for Xbox Series X|S. Delivers identical speed to the internal SSD to play games directly without sacrificing performance.',16990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(303,'WD Black SN850P SSD (PS5)','Officially licensed 1TB M.2 NVMe SSD for PS5 with pre-installed heatsink. Delivers up to 7300MB/s read speeds for seamless game installations and fast loading.',12990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(304,'PS5 Spidey Edition','Official PlayStation 5 console covers featuring Marvel Spider-Man 2 limited edition design. Easy snap-on installation compatible with PS5 disc version.',4990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(305,'Xbox Wireless Controller','Modern ergonomic wireless controller with textured grips, hybrid D-pad, and Share button. Connects seamlessly via Bluetooth to Xbox, Windows PC, Android, and iOS.',5390.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(306,'HD Camera for PS5','Dual 1080p lenses for picture-in-picture streaming during broadcast. Features background removal tools and built-in adjustable stand for monitor mounting.',4990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(307,'PS5 Gold Edition','Premium wireless controller featuring metallic gold finish and custom accent buttons. Offers adaptive triggers, haptic feedback, and built-in microphone array.',6990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(308,'Nintendo Switch Pro Controller','Full-sized wireless controller with motion controls, HD rumble, and built-in amiibo NFC functionality. Ergonomic design for extended gaming sessions.',5990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(309,'PlayStation Media Remote','Convenient media navigation remote with dedicated app launch buttons for Netflix, YouTube, and Spotify. Built-in IR transmitter to control TV power and volume.',2490.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(310,'KontrolFreek Performance Thumbsticks','High-rise thumbsticks engineered to increase precision and grip during competitive FPS games. Reduces wrist fatigue and enhances target acquisition accuracy.',1490.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(311,'PlayStation Access Controller','Highly customizable accessibility controller kit designed to help players with disabilities play more comfortably. Features swappable button caps and 360 positioning.',8990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(312,'DualSense Charging Station','Click-in charging dock capable of fast-charging up to two DualSense controllers simultaneously. Frees up USB ports on your PS5 while keeping controllers organized.',2290.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(313,'Joy-Con Controllers (Neon)','Pair of vibrant Neon Red and Neon Blue Joy-Con controllers for Nintendo Switch. Includes motion controls, HD rumble, and wrist straps for multiplayer gaming.',6990.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(314,'DualSense Wireless Controller','Innovative PS5 controller featuring immersive haptic feedback and dynamic adaptive triggers. Built-in microphone and motion sensors elevate your gaming immersion.',5790.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(315,'Joy-Con Charging Grip','Ergonomic grip that combines two Joy-Cons into a traditional controller while charging them via USB-C during gameplay. Features charging status LED indicator.',2190.00,1,3,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(401,'One Piece King of Artist The Monkey D. Luffy Figure','Premium Banpresto collectible figure showcasing Luffy in an iconic action stance. Crafted with high-grade PVC material and vibrant anime-accurate painted details.',3490.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(402,'ARTFX J Demon Slayer Uzui Tengen 1:8 Scale PVC Figure','Highly detailed 1:8 scale Kotobukiya statue of the Sound Hashira Uzui Tengen. Features dynamic dual Nichirin blades, intricate uniform sculpting, and a display base.',12990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(403,'Marvel Spider-Man Titan Hero Series Ultimate Spiderman Miles Morales Figure','12-inch scale action figure of Miles Morales with multiple points of articulation. Compatible with Titan Hero Blast Gear accessories for dynamic display setups.',1790.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(404,'Anime Figures Cartoon Character Cute Model Collectable Figure','Adorable chibi desktop collectible anime figure crafted from durable non-toxic PVC. Perfect decorative display piece for gaming desks, shelves, or computer cases.',1290.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(405,'Bestier 51 L Shaped Gaming Desk with Power Outlets and LED','Reversible L-shaped gaming desk equipped with integrated power sockets, USB charging ports, and RGB LED light strips. Features carbon fiber texture and 4-tier shelves.',14990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(406,'Eivanet 53inch L Shaped Gaming Desk with Power Outlets and LED Lights','Spacious corner computer desk featuring a full monitor stand, headphone hooks, and storage side bag. Built-in Smart LED lighting syncs with music and game audio.',15990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(407,'FIFINE Gaming Dynamic Mic Bundle XLR USB with RGB Boom Arm','Professional streaming microphone setup featuring dual XLR/USB connectivity, customizable RGB lighting, audio mixer, and an adjustable heavy-duty boom arm.',7990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(408,'Eivanet L Shaped Gaming Desk with Power Outlet and LED Light','Ergonomic L-desk with built-in power strip, reversible storage shelves, and sliding drawer. Premium carbon fiber surface offers scratch-resistant and waterproof durability.',13990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(409,'L-Shaped Gaming Desk Large Standing Desk with Storage Shelves','Heavy-duty dual-motor electric height-adjustable corner desk with memory presets. Provides smooth transition from sitting to standing for healthy long gaming sessions.',16990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(410,'Gaming Chair Racing Ergonomic High Back PU Leather Pink','Stylish pink and white ergonomic racing chair with thick padded memory foam, headrest, lumbar support, and flip-up armrests. Smooth 360-degree swivel wheels.',11990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(411,'Kosker Headset Stand 3 Tiers for Desk','Multi-functional 3-tier desktop organizer stand capable of holding up to 9 controllers and headphones. Heavy-duty weighted metal base ensures non-tip stability.',2490.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(412,'GTPLAYER Gaming Chair with Speakers and Footrest Blue','High-back Esports gaming chair featuring dual Bluetooth wireless speakers, retractable footrest, and 150-degree reclining backrest. Premium velvet and leather upholstery.',14990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(413,'GTPLAYER Big and Tall Gaming Chair Ergonomic Heavy Duty','Heavy-duty gaming chair designed for big and tall gamers, supporting up to 180kg. Features breathable mesh backing, adjustable lumbar pillow, and thick padded seat.',17990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(414,'Massage Gaming Chair with LED Light and Speakers Black','Ultimate gaming throne equipped with lumbar massage function, perimeter RGB LED lights, Bluetooth speakers, and a pull-out footrest for relaxation between matches.',18990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL),(415,'Gaming Chair with Massage function LED Light and Speakers Black','Deluxe ergonomic reclining computer chair with built-in USB-powered massage pillow, ambient RGB lighting, dual audio speakers, and high-density foam padding.',18990.00,1,4,'2026-07-28 06:30:55','2026-08-01 16:47:21',NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'sagar','sagar@gmail.com','$2a$10$yuWAB4NZ1exWngektvfM.OCmZ8eJiSn2lLXPgNNfp6FxABuKCCR1K','ADMIN',NULL,'2026-08-04 04:53:09'),(2,'deep','deep@gmail.com','$2a$10$yeAYOJEgBZkzfgXsSgIhduvI7RU1pb/wFuz07xB5rCaINM1hL5mmS','CUSTOMER',NULL,'2026-08-04 04:53:09');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-04 23:01:56
