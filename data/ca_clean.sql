-- MySQL dump 10.13  Distrib 5.6.16, for osx10.7 (x86_64)
--
-- Host: localhost    Database: ca
-- ------------------------------------------------------
-- Server version	5.6.16

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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_case`
--

LOCK TABLES `ca_case` WRITE;
/*!40000 ALTER TABLE `ca_case` DISABLE KEYS */;
INSERT INTO `ca_case` VALUES (1,'Campus Theft Case','2014-07-22 11:19:48','2013-08-05 18:47:35','My Calendar','My Graph','My Map'),(2,'Practice','2014-07-28 10:47:42','2014-09-17 18:04:32','My Calendar','My Graph','My Map'),(3,'Campus Theft Case-3','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(4,'Campus Theft Case-4','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(5,'Campus Theft Case-5','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(6,'Campus Theft Case-6','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(7,'Campus Theft Case-7','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(8,'Campus Theft Case-8','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(9,'Campus Theft Case-9','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(10,'Campus Theft Case-10','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(11,'Campus Theft Case-11','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(12,'Campus Theft Case-12','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(13,'Campus Theft Case-13','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map'),(14,'Campus Theft Case-14','2014-09-17 14:02:57','2014-09-17 18:02:57','My Calendar','My Graph','My Map');
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
INSERT INTO `ca_doc` VALUES ('18042d53f412ee1a5c65ac1e0f599a22','2014-08-04 14:36:13','2014-08-04 18:36:13','WebAnalystPhase1',1),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase1',3),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase1',4),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase1',5),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase1',6),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase1',7),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase1',8),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:54','2014-08-04 18:36:13','WebAnalystPhase1',9),('18042d53f412ee1a5c65ac1e0f599a22','2014-09-17 14:11:54','2014-08-04 18:36:13','WebAnalystPhase1',10),('1d31bb524f1f3e12b457cc5624e398fd','2014-08-04 14:36:13','2014-08-04 18:36:13','WebAnalystPhase3',1),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase3',3),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase3',4),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase3',5),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase3',6),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase3',7),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase3',8),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:54','2014-08-04 18:36:13','WebAnalystPhase3',9),('1d31bb524f1f3e12b457cc5624e398fd','2014-09-17 14:11:54','2014-08-04 18:36:13','WebAnalystPhase3',10),('2c35de333c4d013d7686bc49058bc371','2014-08-04 14:36:13','2014-08-04 18:36:13','RecordAnalystPhase2',1),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase2',3),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase2',4),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase2',5),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase2',6),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase2',7),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase2',8),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:54','2014-08-04 18:36:13','RecordAnalystPhase2',9),('2c35de333c4d013d7686bc49058bc371','2014-09-17 14:11:54','2014-08-04 18:36:13','RecordAnalystPhase2',10),('39cc6efabe9ccc4829ada41bad10e3be','2014-07-28 10:47:49','2014-09-17 18:04:11','Practice',2),('a826ade0f0f8537f1f0c5a9738286ddc','2014-08-04 14:36:13','2014-08-04 18:36:13','WebAnalystPhase2',1),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase2',3),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase2',4),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase2',5),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase2',6),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase2',7),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:53','2014-08-04 18:36:13','WebAnalystPhase2',8),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:54','2014-08-04 18:36:13','WebAnalystPhase2',9),('a826ade0f0f8537f1f0c5a9738286ddc','2014-09-17 14:11:54','2014-08-04 18:36:13','WebAnalystPhase2',10),('b25fc7296fee138aa3086aa559a2ebe7','2014-08-04 14:36:13','2014-08-04 18:36:13','RecordAnalystPhase3',1),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase3',3),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase3',4),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase3',5),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase3',6),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase3',7),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase3',8),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:54','2014-08-04 18:36:13','RecordAnalystPhase3',9),('b25fc7296fee138aa3086aa559a2ebe7','2014-09-17 14:11:54','2014-08-04 18:36:13','RecordAnalystPhase3',10),('bbef3dec2a68238f01bf8c3e04126a7f','2014-08-04 14:33:19','2014-08-04 18:33:19','InterviewAnalystPhase1',1),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:53','2014-08-04 18:33:19','InterviewAnalystPhase1',3),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:53','2014-08-04 18:33:19','InterviewAnalystPhase1',4),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:53','2014-08-04 18:33:19','InterviewAnalystPhase1',5),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:53','2014-08-04 18:33:19','InterviewAnalystPhase1',6),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:53','2014-08-04 18:33:19','InterviewAnalystPhase1',7),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:53','2014-08-04 18:33:19','InterviewAnalystPhase1',8),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:54','2014-08-04 18:33:19','InterviewAnalystPhase1',9),('bbef3dec2a68238f01bf8c3e04126a7f','2014-09-17 14:11:54','2014-08-04 18:33:19','InterviewAnalystPhase1',10),('c24f648589beb63aedeb37a68834a487','2014-08-04 14:36:13','2014-08-04 18:36:13','InterviewAnalystPhase3',1),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase3',3),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase3',4),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase3',5),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase3',6),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase3',7),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase3',8),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:54','2014-08-04 18:36:13','InterviewAnalystPhase3',9),('c24f648589beb63aedeb37a68834a487','2014-09-17 14:11:54','2014-08-04 18:36:13','InterviewAnalystPhase3',10),('c3459035ee43dbcd1c3c48946efbb865','2014-08-04 14:36:13','2014-08-04 18:36:13','RecordAnalystPhase1',1),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase1',3),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase1',4),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase1',5),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase1',6),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase1',7),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:53','2014-08-04 18:36:13','RecordAnalystPhase1',8),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:54','2014-08-04 18:36:13','RecordAnalystPhase1',9),('c3459035ee43dbcd1c3c48946efbb865','2014-09-17 14:11:54','2014-08-04 18:36:13','RecordAnalystPhase1',10),('c742c5a36b6307267bb709355feb2c41','2014-07-22 11:20:41','2014-08-11 19:24:58','Instruction',1),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:53','2014-08-11 19:24:58','Instruction',3),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:53','2014-08-11 19:24:58','Instruction',4),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:53','2014-08-11 19:24:58','Instruction',5),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:53','2014-08-11 19:24:58','Instruction',6),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:53','2014-08-11 19:24:58','Instruction',7),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:53','2014-08-11 19:24:58','Instruction',8),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:54','2014-08-11 19:24:58','Instruction',9),('c742c5a36b6307267bb709355feb2c41','2014-09-17 14:11:54','2014-08-11 19:24:58','Instruction',10),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-08-04 14:36:13','2014-08-04 18:36:13','InterviewAnalystPhase2',1),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase2',3),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase2',4),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase2',5),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase2',6),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase2',7),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:53','2014-08-04 18:36:13','InterviewAnalystPhase2',8),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:54','2014-08-04 18:36:13','InterviewAnalystPhase2',9),('cd8273c1a63a5ec4adfb2c179e3f3341','2014-09-17 14:11:54','2014-08-04 18:36:13','InterviewAnalystPhase2',10);
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
  `rindex` int(11) NOT NULL DEFAULT '0',
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
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ca_case_id` int(11) NOT NULL,
  `creator` varchar(40) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`id`,`ca_case_id`),
  KEY `fk_ca_relation_ca_case1_idx` (`ca_case_id`),
  CONSTRAINT `fk_ca_relation_ca_case1` FOREIGN KEY (`ca_case_id`) REFERENCES `ca_case` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_user`
--

LOCK TABLES `ca_user` WRITE;
/*!40000 ALTER TABLE `ca_user` DISABLE KEYS */;
INSERT INTO `ca_user` VALUES (2,'test','test','test1@sdf',NULL,'2014-07-22 11:12:35','2014-07-22 15:12:35'),(3,'test2','test2','test@test.com',NULL,'2014-07-24 16:05:04','2014-07-24 20:05:04'),(4,'test3','test3','test@test.com',NULL,'2014-07-28 11:37:58','2014-07-24 20:05:04'),(18,'Web','web','web@test.com',NULL,'2014-08-22 10:35:13','2014-08-22 14:35:13'),(19,'Interview','interview','interview@test.com',NULL,'2014-08-22 10:35:13','2014-08-22 14:35:13'),(20,'Record','record','record@test.com',NULL,'2014-08-22 10:35:13','2014-08-22 14:35:13'),(21,'Web3','web',NULL,NULL,'2014-09-17 13:55:30','2014-09-17 17:55:30'),(22,'Interview3','interview',NULL,NULL,'2014-09-17 13:55:30','2014-09-17 17:55:30'),(23,'Record3','record',NULL,NULL,'2014-09-17 13:55:30','2014-09-17 17:55:30'),(24,'Web4','web',NULL,NULL,'2014-09-17 13:55:30','2014-09-17 17:55:30'),(25,'Interview4','interview',NULL,NULL,'2014-09-17 13:55:30','2014-09-17 17:55:30'),(26,'Record4','record',NULL,NULL,'2014-09-17 13:55:30','2014-09-17 17:55:30'),(27,'Web5','web',NULL,NULL,'2014-09-17 13:55:30','2014-09-17 17:55:30'),(28,'Interview5','interview',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(29,'Record5','record',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(30,'Web6','web',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(31,'Interview6','interview',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(32,'Record6','record',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(33,'Web7','web',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(34,'Interview7','interview',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(35,'Record7','record',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(36,'Web8','web',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(37,'Interview8','interview',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(38,'Record8','record',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(39,'Web9','web',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(40,'Interview9','interview',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(41,'Record9','record',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(42,'Web10','web',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(43,'Interview10','interview',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31'),(44,'Record10','record',NULL,NULL,'2014-09-17 13:55:31','2014-09-17 17:55:31');
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
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ca_usercase`
--

LOCK TABLES `ca_usercase` WRITE;
/*!40000 ALTER TABLE `ca_usercase` DISABLE KEYS */;
INSERT INTO `ca_usercase` VALUES (1,'owner',1,2,NULL),(2,'collaborator',1,3,NULL),(3,'collaborator',2,2,NULL),(4,'owner',2,4,NULL),(29,'collaborator',1,18,NULL),(30,'collaborator',2,18,NULL),(31,'collaborator',1,19,NULL),(32,'collaborator',2,19,NULL),(33,'collaborator',1,20,NULL),(34,'collaborator',2,20,NULL),(35,'collaborator',3,21,NULL),(36,'collaborator',3,22,NULL),(37,'collaborator',3,23,NULL),(38,'collaborator',4,24,NULL),(39,'collaborator',4,25,NULL),(40,'collaborator',4,26,NULL),(41,'collaborator',5,27,NULL),(42,'collaborator',5,28,NULL),(43,'collaborator',5,29,NULL),(44,'collaborator',6,30,NULL),(45,'collaborator',6,31,NULL),(46,'collaborator',6,32,NULL),(47,'collaborator',7,33,NULL),(48,'collaborator',7,34,NULL),(49,'collaborator',7,35,NULL),(50,'collaborator',8,36,NULL),(51,'collaborator',8,37,NULL),(52,'collaborator',8,38,NULL),(53,'collaborator',9,39,NULL),(54,'collaborator',9,40,NULL),(55,'collaborator',9,41,NULL),(56,'collaborator',10,42,NULL),(57,'collaborator',10,43,NULL),(58,'collaborator',10,44,NULL),(59,'collaborator',2,21,NULL),(60,'collaborator',2,22,NULL),(61,'collaborator',2,23,NULL),(62,'collaborator',2,24,NULL),(63,'collaborator',2,25,NULL),(64,'collaborator',2,26,NULL),(65,'collaborator',2,27,NULL),(66,'collaborator',2,28,NULL),(67,'collaborator',2,29,NULL),(68,'collaborator',2,30,NULL),(69,'collaborator',2,31,NULL),(70,'collaborator',2,32,NULL),(71,'collaborator',2,33,NULL),(72,'collaborator',2,34,NULL),(73,'collaborator',2,35,NULL),(74,'collaborator',2,36,NULL),(75,'collaborator',2,37,NULL),(76,'collaborator',2,38,NULL),(77,'collaborator',2,39,NULL),(78,'collaborator',2,40,NULL),(79,'collaborator',2,41,NULL),(80,'collaborator',2,42,NULL),(81,'collaborator',2,43,NULL),(82,'collaborator',2,44,NULL),(83,'collaborator',2,44,NULL);
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

-- Dump completed on 2014-09-17 17:07:20
