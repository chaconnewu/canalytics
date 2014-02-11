-- MySQL dump 10.13  Distrib 5.5.27, for osx10.6 (i386)
--
-- Host: localhost    Database: ca
-- ------------------------------------------------------
-- Server version	5.5.27-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ca_annotation`
--

DROP TABLE IF EXISTS `ca_annotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_annotation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` text,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `quote` text,
  `range_start` varchar(200) DEFAULT NULL,
  `range_end` varchar(200) DEFAULT NULL,
  `startOffset` int(11) DEFAULT NULL,
  `endOffset` int(11) DEFAULT NULL,
  `tags` varchar(100) DEFAULT NULL,
  `user` varchar(45) DEFAULT NULL,
  `permission_read` varchar(200) DEFAULT NULL,
  `permission_update` varchar(200) DEFAULT NULL,
  `permission_delete` varchar(200) DEFAULT NULL,
  `permission_admin` varchar(200) DEFAULT NULL,
  `start` varchar(45) DEFAULT NULL,
  `end` varchar(45) DEFAULT NULL,
  `rrepeat` int(11) DEFAULT NULL,
  `rinterval` varchar(10) DEFAULT NULL,
  `end_after` varchar(45) DEFAULT NULL,
  `ca_location_location` varchar(250) DEFAULT NULL,
  `ca_relation_id` int(11) DEFAULT NULL,
  `ca_doc_uuid` varchar(32) NOT NULL,
  `ca_case_id` int(11) NOT NULL,
  PRIMARY KEY (`id`,`ca_doc_uuid`,`ca_case_id`),
  KEY `fk_ca_annotation_ca_location1_idx` (`ca_location_location`),
  KEY `fk_ca_annotation_ca_relation1_idx` (`ca_relation_id`),
  KEY `fk_ca_annotation_ca_doc1_idx` (`ca_doc_uuid`,`ca_case_id`),
  CONSTRAINT `fk_ca_annotation_ca_doc1` FOREIGN KEY (`ca_doc_uuid`, `ca_case_id`) REFERENCES `ca_doc` (`uuid`, `ca_case_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_annotation_ca_location1` FOREIGN KEY (`ca_location_location`) REFERENCES `ca_location` (`location`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_annotation_ca_relation1` FOREIGN KEY (`ca_relation_id`) REFERENCES `ca_relation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_annotation`
--

LOCK TABLES `ca_annotation` WRITE;
/*!40000 ALTER TABLE `ca_annotation` DISABLE KEYS */;
/*!40000 ALTER TABLE `ca_annotation` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`annotation_created`
BEFORE INSERT ON `ca`.`ca_annotation`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_case`
--

DROP TABLE IF EXISTS `ca_case`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_case` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `calendar` varchar(100) DEFAULT NULL,
  `graph` varchar(100) DEFAULT NULL,
  `map` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_case`
--

LOCK TABLES `ca_case` WRITE;
/*!40000 ALTER TABLE `ca_case` DISABLE KEYS */;
INSERT INTO `ca_case` VALUES (1,'Campus Theft Case','2013-08-01 10:24:36','2013-08-05 14:47:35','My Calendar','My Graph','My Map');
/*!40000 ALTER TABLE `ca_case` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`case_created`
BEFORE INSERT ON `ca`.`ca_case`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_doc`
--

DROP TABLE IF EXISTS `ca_doc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_doc` (
  `uuid` varchar(32) NOT NULL,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `title` varchar(100) NOT NULL,
  `ca_case_id` int(11) NOT NULL,
  PRIMARY KEY (`uuid`,`ca_case_id`),
  KEY `fk_ca_doc_ca_case1_idx` (`ca_case_id`),
  CONSTRAINT `fk_ca_doc_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_doc`
--

LOCK TABLES `ca_doc` WRITE;
/*!40000 ALTER TABLE `ca_doc` DISABLE KEYS */;
INSERT INTO `ca_doc` VALUES ('0275512a5ae766024248c630066dde71',NULL,'2013-08-05 14:55:38','plaindoc',1);
/*!40000 ALTER TABLE `ca_doc` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`doc_created`
BEFORE INSERT ON `ca`.`ca_doc`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_event`
--

DROP TABLE IF EXISTS `ca_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `title` varchar(100) NOT NULL,
  `start` varchar(45) NOT NULL,
  `end` varchar(45) NOT NULL,
  `rrepeat` int(11) DEFAULT NULL,
  `rinterval` varchar(10) DEFAULT NULL,
  `end_after` varchar(45) DEFAULT NULL,
  `rindex` int(11) NOT NULL,
  `ca_case_id` int(11) NOT NULL,
  `ca_location_location` varchar(250) DEFAULT NULL,
  `ca_annotation_id` int(11) DEFAULT NULL,
  `ca_relation_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`,`rindex`,`ca_case_id`),
  KEY `fk_ca_event_ca_case1_idx` (`ca_case_id`),
  KEY `fk_ca_event_ca_location1_idx` (`ca_location_location`),
  KEY `fk_ca_event_ca_annotation1_idx` (`ca_annotation_id`),
  KEY `fk_ca_event_ca_relation1_idx` (`ca_relation_id`),
  CONSTRAINT `fk_ca_event_ca_annotation1` FOREIGN KEY (`ca_annotation_id`) REFERENCES `ca_annotation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_location1` FOREIGN KEY (`ca_location_location`) REFERENCES `ca_location` (`location`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_relation1` FOREIGN KEY (`ca_relation_id`) REFERENCES `ca_relation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_event`
--

LOCK TABLES `ca_event` WRITE;
/*!40000 ALTER TABLE `ca_event` DISABLE KEYS */;
INSERT INTO `ca_event` VALUES (87,'2014-01-25 17:48:17','2014-01-25 22:48:17','New Event','2014-01-01T00:00:00','2014-01-01T01:00:00',NULL,NULL,NULL,0,1,NULL,NULL,56);
/*!40000 ALTER TABLE `ca_event` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`event_created`
BEFORE INSERT ON `ca`.`ca_event`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_location`
--

DROP TABLE IF EXISTS `ca_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_location` (
  `location` varchar(250) NOT NULL,
  `lat` float NOT NULL,
  `lng` float NOT NULL,
  `ca_case_id` int(11) NOT NULL,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`location`,`ca_case_id`),
  KEY `fk_ca_location_ca_case1_idx` (`ca_case_id`),
  CONSTRAINT `fk_ca_location_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_location`
--

LOCK TABLES `ca_location` WRITE;
/*!40000 ALTER TABLE `ca_location` DISABLE KEYS */;
/*!40000 ALTER TABLE `ca_location` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`location_created`
BEFORE INSERT ON `ca`.`ca_location`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_person`
--

DROP TABLE IF EXISTS `ca_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_person` (
  `name` varchar(100) NOT NULL,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ca_relation_id` int(11) NOT NULL,
  PRIMARY KEY (`name`,`ca_relation_id`),
  KEY `fk_ca_person_ca_relation1_idx` (`ca_relation_id`),
  CONSTRAINT `fk_ca_person_ca_relation1` FOREIGN KEY (`ca_relation_id`) REFERENCES `ca_relation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_person`
--

LOCK TABLES `ca_person` WRITE;
/*!40000 ALTER TABLE `ca_person` DISABLE KEYS */;
INSERT INTO `ca_person` VALUES ('Kate','2014-01-25 17:48:17','2014-01-25 22:48:17',56),('Mary','2014-01-25 17:48:17','2014-01-25 22:48:17',56);
/*!40000 ALTER TABLE `ca_person` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`person_created`
BEFORE INSERT ON `ca`.`ca_person`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_relation`
--

DROP TABLE IF EXISTS `ca_relation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_relation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relation` varchar(45) NOT NULL,
  `created` varchar(45) DEFAULT NULL,
  `updated` varchar(45) NOT NULL,
  `ca_case_id` int(11) NOT NULL,
  PRIMARY KEY (`id`,`ca_case_id`),
  KEY `fk_ca_relation_ca_case1_idx` (`ca_case_id`),
  CONSTRAINT `fk_ca_relation_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_relation`
--

LOCK TABLES `ca_relation` WRITE;
/*!40000 ALTER TABLE `ca_relation` DISABLE KEYS */;
INSERT INTO `ca_relation` VALUES (56,'related','2014-01-25 17:48:17','',1);
/*!40000 ALTER TABLE `ca_relation` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`relation_created`
BEFORE INSERT ON `ca`.`ca_relation`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_user`
--

DROP TABLE IF EXISTS `ca_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_user`
--

LOCK TABLES `ca_user` WRITE;
/*!40000 ALTER TABLE `ca_user` DISABLE KEYS */;
INSERT INTO `ca_user` VALUES (2,'test','test',NULL,NULL,NULL,'0000-00-00 00:00:00'),(3,'police','police',NULL,NULL,'2013-08-06 15:21:40','2013-08-06 19:21:40'),(4,'investigator','investigator',NULL,NULL,'2013-08-06 15:25:48','2013-08-06 19:25:48');
/*!40000 ALTER TABLE `ca_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ALLOW_INVALID_DATES,ERROR_FOR_DIVISION_BY_ZERO,TRADITIONAL,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `ca`.`user_created`
BEFORE INSERT ON `ca`.`ca_user`
FOR EACH ROW
SET NEW.created = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `ca_usercase`
--

DROP TABLE IF EXISTS `ca_usercase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_usercase` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` varchar(20) NOT NULL,
  `ca_case_id` int(11) NOT NULL,
  `ca_user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`,`role`,`ca_case_id`,`ca_user_id`),
  KEY `fk_ca_usercase_ca_case1_idx` (`ca_case_id`),
  KEY `fk_ca_usercase_ca_user1_idx` (`ca_user_id`),
  CONSTRAINT `fk_ca_usercase_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_usercase_ca_user1` FOREIGN KEY (`ca_user_id`) REFERENCES `ca_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_usercase`
--

LOCK TABLES `ca_usercase` WRITE;
/*!40000 ALTER TABLE `ca_usercase` DISABLE KEYS */;
INSERT INTO `ca_usercase` VALUES (3,'owner',1,2),(4,'collaborator',1,3),(5,'collaborator',1,4);
/*!40000 ALTER TABLE `ca_usercase` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-01-28 16:30:02
