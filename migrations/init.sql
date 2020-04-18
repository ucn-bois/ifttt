-- MariaDB dump 10.17  Distrib 10.4.12-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: ifttt
-- ------------------------------------------------------
-- Server version	10.4.12-MariaDB-1:10.4.12+maria~bionic

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `applets`
--

DROP TABLE IF EXISTS `applets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `applets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `homepage` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applets_path_uindex` (`homepage`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applets`
--

LOCK TABLES `applets` WRITE;
/*!40000 ALTER TABLE `applets` DISABLE KEYS */;
INSERT INTO `applets` VALUES (1,'COVID19 Mail Report','Get the latest statistics of COVID19 in country of your choice ','/applets/covid19-report-mail'),(2,'Dropbox Watcher','Get email whenever there is update on your own Dropbox space','/applets/dropbox-watcher'),(3,'GitHub Watcher','Get an email whenever there is a commit pushed to a remote repository of you choice','/applets/github-watcher');
/*!40000 ALTER TABLE `applets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passwordResets`
--

DROP TABLE IF EXISTS `passwordResets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `passwordResets` (
  `userId` int(11) NOT NULL,
  `pending` tinyint(1) NOT NULL DEFAULT 1,
  `identifier` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `passwordResets_identifier_uindex` (`identifier`),
  KEY `passwordResets_users_id_fk` (`userId`),
  CONSTRAINT `passwordResets_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passwordResets`
--

LOCK TABLES `passwordResets` WRITE;
/*!40000 ALTER TABLE `passwordResets` DISABLE KEYS */;
/*!40000 ALTER TABLE `passwordResets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userApplets`
--

DROP TABLE IF EXISTS `userApplets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userApplets` (
  `userId` int(11) NOT NULL,
  `appletId` int(11) NOT NULL,
  `identifier` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `configuration` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  UNIQUE KEY `userApplets_identifier_uindex` (`identifier`),
  UNIQUE KEY `userApplets_userId_appletId_uindex` (`userId`,`appletId`),
  KEY `userApplets_applets_id_fk` (`appletId`),
  CONSTRAINT `userApplets_applets_id_fk` FOREIGN KEY (`appletId`) REFERENCES `applets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userApplets_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `configuration` CHECK (json_valid(`configuration`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userApplets`
--

LOCK TABLES `userApplets` WRITE;
/*!40000 ALTER TABLE `userApplets` DISABLE KEYS */;
/*!40000 ALTER TABLE `userApplets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userVerifications`
--

DROP TABLE IF EXISTS `userVerifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userVerifications` (
  `userId` int(11) NOT NULL,
  `pending` tinyint(1) NOT NULL DEFAULT 1,
  `identifier` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `accountVerifications_identifier_uindex` (`identifier`),
  KEY `accountVerifications_users_id_fk` (`userId`),
  CONSTRAINT `accountVerifications_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userVerifications`
--

LOCK TABLES `userVerifications` WRITE;
/*!40000 ALTER TABLE `userVerifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `userVerifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` char(60) NOT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_uindex` (`email`),
  UNIQUE KEY `users_username_uindex` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-04-06 22:34:00
