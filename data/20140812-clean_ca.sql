-- MySQL dump 10.13  Distrib 5.6.10, for osx10.8 (x86_64)
--
-- Host: localhost    Database: ca
-- ------------------------------------------------------
-- Server version	5.6.10

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
-- Table structure for table `ca_activitylog`
--

DROP TABLE IF EXISTS `ca_activitylog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_activitylog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `operation` varchar(500) DEFAULT NULL,
  `artifact` varchar(100) DEFAULT NULL,
  `data` varchar(5000) DEFAULT NULL,
  `time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `ca_user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=673 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_activitylog`
--

LOCK TABLES `ca_activitylog` WRITE;
/*!40000 ALTER TABLE `ca_activitylog` DISABLE KEYS */;
/*!40000 ALTER TABLE `ca_activitylog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ca_annotation`
--

DROP TABLE IF EXISTS `ca_annotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ca_annotation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(500) DEFAULT NULL,
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
  `creator` varchar(40) DEFAULT NULL,
  `editors` varchar(500) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `rindex` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`,`rindex`,`ca_doc_uuid`,`ca_case_id`),
  KEY `fk_ca_annotation_ca_location1_idx` (`ca_location_location`),
  KEY `fk_ca_annotation_ca_relation1_idx` (`ca_relation_id`),
  KEY `fk_ca_annotation_ca_doc1_idx` (`ca_doc_uuid`,`ca_case_id`),
  CONSTRAINT `fk_ca_annotation_ca_doc1` FOREIGN KEY (`ca_doc_uuid`, `ca_case_id`) REFERENCES `ca_doc` (`uuid`, `ca_case_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_annotation_ca_location1` FOREIGN KEY (`ca_location_location`) REFERENCES `ca_location` (`location`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_annotation_ca_relation1` FOREIGN KEY (`ca_relation_id`) REFERENCES `ca_relation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_case`
--

LOCK TABLES `ca_case` WRITE;
/*!40000 ALTER TABLE `ca_case` DISABLE KEYS */;
INSERT INTO `ca_case` VALUES (1,'Campus Theft Case','2014-07-22 11:19:48','2013-08-05 18:47:35','My Calendar','My Graph','My Map'),(2,'Instruction ','2014-07-28 10:47:42','2013-08-05 18:47:35','My Calendar','My Graph','My Map');
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
INSERT INTO `ca_doc` VALUES ('18042d53f412ee1a5c65ac1e0f599a22','2014-08-04 14:36:13','2014-08-04 18:36:13','WebAnalystPhase1',1),('1d31bb524f1f3e12b457cc5624e398fd','2014-08-04 14:36:13','2014-08-04 18:36:13','WebAnalystPhase3',1),('2c35de333c4d013d7686bc49058bc371','2014-08-04 14:36:13','2014-08-04 18:36:13','RecordAnalystPhase2',1),('39cc6efabe9ccc4829ada41bad10e3be','2014-07-28 10:47:49','2014-08-04 18:04:20','instruction',2),('a826ade0f0f8537f1f0c5a9738286ddc','2014-08-04 14:36:13','2014-08-04 18:36:13','WebAnalystPhase2',1),('b25fc7296fee138aa3086aa559a2ebe7','2014-08-04 14:36:13','2014-08-04 18:36:13','RecordAnalystPhase3',1),('bbef3dec2a68238f01bf8c3e04126a7f','2014-08-04 14:33:19','2014-08-04 18:33:19','InterviewAnalystPhase1',1),('c24f648589beb63aedeb37a68834a487','2014-08-04 14:36:13','2014-08-04 18:36:13','InterviewAnalystPhase3',1),('c3459035ee43dbcd1c3c48946efbb865','2014-08-04 14:36:13','2014-08-04 18:36:13','RecordAnalystPhase1',1),('c742c5a36b6307267bb709355feb2c41','2014-07-22 11:20:41','2014-08-11 19:24:58','Instruction',1),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-08-04 14:36:13','2014-08-04 18:36:13','InterviewAnalystPhase2',1);
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
  `title` varchar(500) NOT NULL,
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
  `creator` varchar(40) DEFAULT NULL,
  `editors` varchar(500) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`,`rindex`,`ca_case_id`),
  KEY `fk_ca_event_ca_case1_idx` (`ca_case_id`),
  KEY `fk_ca_event_ca_location1_idx` (`ca_location_location`),
  KEY `fk_ca_event_ca_annotation1_idx` (`ca_annotation_id`),
  KEY `fk_ca_event_ca_relation1_idx` (`ca_relation_id`),
  CONSTRAINT `fk_ca_event_ca_annotation1` FOREIGN KEY (`ca_annotation_id`) REFERENCES `ca_annotation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_location1` FOREIGN KEY (`ca_location_location`) REFERENCES `ca_location` (`location`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_relation1` FOREIGN KEY (`ca_relation_id`) REFERENCES `ca_relation` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_event`
--

LOCK TABLES `ca_event` WRITE;
/*!40000 ALTER TABLE `ca_event` DISABLE KEYS */;
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
  `creator` varchar(40) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
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
  `creator` varchar(40) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
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
  `creator` varchar(40) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`,`ca_case_id`),
  KEY `fk_ca_relation_ca_case1_idx` (`ca_case_id`),
  CONSTRAINT `fk_ca_relation_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_relation`
--

LOCK TABLES `ca_relation` WRITE;
/*!40000 ALTER TABLE `ca_relation` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_user`
--

LOCK TABLES `ca_user` WRITE;
/*!40000 ALTER TABLE `ca_user` DISABLE KEYS */;
INSERT INTO `ca_user` VALUES (2,'test','test','test1@sdf',NULL,'2014-07-22 11:12:35','2014-07-22 15:12:35'),(3,'test2','test2','test@test.com',NULL,'2014-07-24 16:05:04','2014-07-24 20:05:04'),(4,'test3','test3','test@test.com',NULL,'2014-07-28 11:37:58','2014-07-24 20:05:04'),(5,'my','my','my@as.com',NULL,'2014-08-04 14:45:27','2014-08-04 18:45:27'),(6,'Alex','alex','alex@test.com',NULL,'2014-08-04 14:47:40','2014-08-04 18:47:40'),(7,'Sam','sam','sam@test.com',NULL,'2014-08-04 14:48:11','2014-08-04 18:48:11'),(8,'Jenny','jenny','jenny@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(9,'Tommy','tommy','tommy@test.omc',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(10,'Alvin','alvin','alvin@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(11,'Beckett','beckett','beckett@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(12,'Boyce','boyce','boyce@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(13,'Jake','jake','jake@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(14,'Rob','rob','rob@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(15,'Jerry','jerry','jerry@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(16,'Liz','liz','liz@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27'),(17,'Joe','joe','joe@test.com',NULL,'2014-08-04 14:52:27','2014-08-04 18:52:27');
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
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`,`role`,`ca_case_id`,`ca_user_id`),
  KEY `fk_ca_usercase_ca_case1_idx` (`ca_case_id`),
  KEY `fk_ca_usercase_ca_user1_idx` (`ca_user_id`),
  CONSTRAINT `fk_ca_usercase_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_usercase_ca_user1` FOREIGN KEY (`ca_user_id`) REFERENCES `ca_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_usercase`
--

LOCK TABLES `ca_usercase` WRITE;
/*!40000 ALTER TABLE `ca_usercase` DISABLE KEYS */;
INSERT INTO `ca_usercase` VALUES (1,'owner',1,2,NULL),(2,'collaborator',1,3,NULL),(3,'collaborator',2,2,NULL),(4,'owner',2,4,NULL),(5,'collaborator',1,6,NULL),(6,'collaborator',2,6,NULL),(7,'collaborator',1,7,NULL),(8,'collaborator',2,7,NULL),(9,'collaborator',1,8,NULL),(10,'collaborator',2,8,NULL),(11,'collaborator',1,9,NULL),(12,'collaborator',2,9,NULL),(13,'collaborator',1,10,NULL),(14,'collaborator',2,10,NULL),(15,'collaborator',1,11,NULL),(16,'collaborator',2,11,NULL),(17,'collaborator',1,12,NULL),(18,'collaborator',2,12,NULL),(19,'collaborator',1,13,NULL),(20,'collaborator',2,13,NULL),(21,'collaborator',1,14,NULL),(22,'collaborator',2,14,NULL),(23,'collaborator',1,15,NULL),(24,'collaborator',2,15,NULL),(25,'collaborator',1,16,NULL),(26,'collaborator',2,16,NULL),(27,'collaborator',1,17,NULL),(28,'collaborator',2,17,NULL);
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

-- Dump completed on 2014-08-12 18:36:54
