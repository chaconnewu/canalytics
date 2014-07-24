SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `ca` ;
CREATE SCHEMA IF NOT EXISTS `ca` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `ca` ;

-- -----------------------------------------------------
-- Table `ca`.`ca_case`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_case` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_case` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `title` VARCHAR(100) NOT NULL ,
  `created` DATETIME NULL ,
  `updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  `calendar` VARCHAR(100) NULL ,
  `graph` VARCHAR(100) NULL ,
  `map` VARCHAR(100) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ca`.`ca_doc`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_doc` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_doc` (
  `uuid` VARCHAR(32) NOT NULL ,
  `created` DATETIME NULL ,
  `updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  `title` VARCHAR(100) NOT NULL ,
  `ca_case_id` INT(11) NOT NULL ,
  PRIMARY KEY (`uuid`, `ca_case_id`) ,
  INDEX `fk_ca_doc_ca_case1_idx` (`ca_case_id` ASC) ,
  CONSTRAINT `fk_ca_doc_ca_case1`
    FOREIGN KEY (`ca_case_id` )
    REFERENCES `ca`.`ca_case` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ca`.`ca_location`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_location` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_location` (
  `location` VARCHAR(250) NOT NULL ,
  `lat` FLOAT NOT NULL ,
  `lng` FLOAT NOT NULL ,
  `ca_case_id` INT(11) NOT NULL ,
  `created` DATETIME NULL ,
  `updated` TIMESTAMP NOT NULL ,
  `creator` VARCHAR(40) NULL ,
  `color` VARCHAR(7) NULL ,
  PRIMARY KEY (`location`, `ca_case_id`) ,
  INDEX `fk_ca_location_ca_case1_idx` (`ca_case_id` ASC) ,
  CONSTRAINT `fk_ca_location_ca_case1`
    FOREIGN KEY (`ca_case_id` )
    REFERENCES `ca`.`ca_case` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ca`.`ca_relation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_relation` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_relation` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `relation` VARCHAR(45) NOT NULL ,
  `created` VARCHAR(45) NULL ,
  `updated` VARCHAR(45) NOT NULL ,
  `ca_case_id` INT(11) NOT NULL ,
  `creator` VARCHAR(40) NULL ,
  `color` VARCHAR(7) NULL ,
  PRIMARY KEY (`id`, `ca_case_id`) ,
  INDEX `fk_ca_relation_ca_case1_idx` (`ca_case_id` ASC) ,
  CONSTRAINT `fk_ca_relation_ca_case1`
    FOREIGN KEY (`ca_case_id` )
    REFERENCES `ca`.`ca_case` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ca`.`ca_annotation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_annotation` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_annotation` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `text` VARCHAR(500) NULL ,
  `created` DATETIME NULL ,
  `updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  `quote` TEXT NULL ,
  `range_start` VARCHAR(200) NULL ,
  `range_end` VARCHAR(200) NULL ,
  `startOffset` INT NULL ,
  `endOffset` INT NULL ,
  `tags` VARCHAR(100) NULL ,
  `user` VARCHAR(45) NULL ,
  `permission_read` VARCHAR(200) NULL ,
  `permission_update` VARCHAR(200) NULL ,
  `permission_delete` VARCHAR(200) NULL ,
  `permission_admin` VARCHAR(200) NULL ,
  `start` VARCHAR(45) NULL ,
  `end` VARCHAR(45) NULL ,
  `rrepeat` INT NULL ,
  `rinterval` VARCHAR(10) NULL ,
  `end_after` VARCHAR(45) NULL ,
  `ca_location_location` VARCHAR(250) NULL ,
  `ca_relation_id` INT NULL ,
  `ca_doc_uuid` VARCHAR(32) NOT NULL ,
  `ca_case_id` INT(11) NOT NULL ,
  `creator` VARCHAR(40) NULL ,
  `editors` VARCHAR(500) NULL ,
  `color` VARCHAR(7) NULL ,
  PRIMARY KEY (`id`, `ca_doc_uuid`, `ca_case_id`) ,
  INDEX `fk_ca_annotation_ca_location1_idx` (`ca_location_location` ASC) ,
  INDEX `fk_ca_annotation_ca_relation1_idx` (`ca_relation_id` ASC) ,
  INDEX `fk_ca_annotation_ca_doc1_idx` (`ca_doc_uuid` ASC, `ca_case_id` ASC) ,
  CONSTRAINT `fk_ca_annotation_ca_location1`
    FOREIGN KEY (`ca_location_location` )
    REFERENCES `ca`.`ca_location` (`location` )
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_annotation_ca_relation1`
    FOREIGN KEY (`ca_relation_id` )
    REFERENCES `ca`.`ca_relation` (`id` )
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_annotation_ca_doc1`
    FOREIGN KEY (`ca_doc_uuid` , `ca_case_id` )
    REFERENCES `ca`.`ca_doc` (`uuid` , `ca_case_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ca`.`ca_event`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_event` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_event` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `created` DATETIME NULL ,
  `updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
  `title` VARCHAR(500) NOT NULL ,
  `start` VARCHAR(45) NOT NULL ,
  `end` VARCHAR(45) NOT NULL ,
  `rrepeat` INT NULL ,
  `rinterval` VARCHAR(10) NULL ,
  `end_after` VARCHAR(45) NULL ,
  `rindex` INT NOT NULL ,
  `ca_case_id` INT(11) NOT NULL ,
  `ca_location_location` VARCHAR(250) NULL ,
  `ca_annotation_id` INT NULL ,
  `ca_relation_id` INT NULL ,
  `creator` VARCHAR(40) NULL ,
  `editors` VARCHAR(500) NULL ,
  `color` VARCHAR(7) NULL ,
  PRIMARY KEY (`id`, `rindex`, `ca_case_id`) ,
  INDEX `fk_ca_event_ca_case1_idx` (`ca_case_id` ASC) ,
  INDEX `fk_ca_event_ca_location1_idx` (`ca_location_location` ASC) ,
  INDEX `fk_ca_event_ca_annotation1_idx` (`ca_annotation_id` ASC) ,
  INDEX `fk_ca_event_ca_relation1_idx` (`ca_relation_id` ASC) ,
  CONSTRAINT `fk_ca_event_ca_case1`
    FOREIGN KEY (`ca_case_id` )
    REFERENCES `ca`.`ca_case` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_location1`
    FOREIGN KEY (`ca_location_location` )
    REFERENCES `ca`.`ca_location` (`location` )
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_annotation1`
    FOREIGN KEY (`ca_annotation_id` )
    REFERENCES `ca`.`ca_annotation` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_event_ca_relation1`
    FOREIGN KEY (`ca_relation_id` )
    REFERENCES `ca`.`ca_relation` (`id` )
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ca`.`ca_user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_user` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT ,
  `username` VARCHAR(40) NOT NULL ,
  `password` VARCHAR(40) NOT NULL ,
  `email` VARCHAR(100) NULL DEFAULT NULL ,
  `admin` TINYINT(1) NULL DEFAULT NULL ,
  `created` DATETIME NULL ,
  `updated` TIMESTAMP NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB
AUTO_INCREMENT = 2;


-- -----------------------------------------------------
-- Table `ca`.`ca_usercase`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_usercase` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_usercase` (
  `id` INT NOT NULL AUTO_INCREMENT ,
  `role` VARCHAR(20) NOT NULL ,
  `ca_case_id` INT(11) NOT NULL ,
  `ca_user_id` INT(11) NOT NULL ,
  `color` VARCHAR(7) NULL ,
  PRIMARY KEY (`id`, `role`, `ca_case_id`, `ca_user_id`) ,
  INDEX `fk_ca_usercase_ca_case1_idx` (`ca_case_id` ASC) ,
  INDEX `fk_ca_usercase_ca_user1_idx` (`ca_user_id` ASC) ,
  CONSTRAINT `fk_ca_usercase_ca_case1`
    FOREIGN KEY (`ca_case_id` )
    REFERENCES `ca`.`ca_case` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_ca_usercase_ca_user1`
    FOREIGN KEY (`ca_user_id` )
    REFERENCES `ca`.`ca_user` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ca`.`ca_person`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ca`.`ca_person` ;

CREATE  TABLE IF NOT EXISTS `ca`.`ca_person` (
  `name` VARCHAR(100) NOT NULL ,
  `created` DATETIME NULL ,
  `updated` TIMESTAMP NOT NULL ,
  `ca_relation_id` INT NOT NULL ,
  `creator` VARCHAR(40) NULL ,
  `color` VARCHAR(7) NULL ,
  PRIMARY KEY (`name`, `ca_relation_id`) ,
  INDEX `fk_ca_person_ca_relation1_idx` (`ca_relation_id` ASC) ,
  CONSTRAINT `fk_ca_person_ca_relation1`
    FOREIGN KEY (`ca_relation_id` )
    REFERENCES `ca`.`ca_relation` (`id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

USE `ca`;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`case_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`case_created`
BEFORE INSERT ON `ca`.`ca_case`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`doc_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`doc_created`
BEFORE INSERT ON `ca`.`ca_doc`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`event_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`event_created`
BEFORE INSERT ON `ca`.`ca_event`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`user_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`user_created`
BEFORE INSERT ON `ca`.`ca_user`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`annotation_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`annotation_created`
BEFORE INSERT ON `ca`.`ca_annotation`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`relation_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`relation_created`
BEFORE INSERT ON `ca`.`ca_relation`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`person_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`person_created`
BEFORE INSERT ON `ca`.`ca_person`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;

DELIMITER $$

USE `ca`$$
DROP TRIGGER IF EXISTS `ca`.`location_created` $$
USE `ca`$$


CREATE
TRIGGER `ca`.`location_created`
BEFORE INSERT ON `ca`.`ca_location`
FOR EACH ROW
SET NEW.created = NOW()$$


DELIMITER ;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
