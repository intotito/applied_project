# MySQL Database using InnoDB engine;

DROP DATABASE IF EXISTS DATA_BANK;

CREATE DATABASE DATA_BANK;

USE DATA_BANK;

DROP TABLE IF EXISTS Stats;
DROP TABLE IF EXISTS Syncs;
DROP TABLE IF EXISTS Paths;

CREATE TABLE Paths (
    _id INT AUTO_INCREMENT, 
    _date DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(16),
    status INT DEFAULT 0, 

    PRIMARY KEY (_id),
    INDEX session_index(session_id)
)Engine=InnoDB;

CREATE TABLE Syncs (
    _id INT AUTO_INCREMENT, 
    user_id VARCHAR(64), 
    class_id INT, 
    sync_date DATETIME,

    PRIMARY KEY (_id),
    INDEX user_index (user_id)
)Engine=InnoDB;

CREATE TABLE Stats (
    _id INT AUTO_INCREMENT,
    _date DATETIME NOT NULL, 
    _user VARCHAR(64) NOT NULL,
    fm_avg_trk_time FLOAT, 
    fm_accuracy FLOAT,
    vx_avg_res_time FLOAT, 
    vx_shot_accuracy FLOAT, 
    vx_trg_accuracy FLOAT, 
    au_avg_res_time FLOAT, 
    bm_HR_max FLOAT, 
    bm_HR_avg FLOAT, 
    bm_HR_var FLOAT, 
    bm_act_steps FLOAT,
    bm_sleep FLOAT,

    PRIMARY KEY (_id),
    INDEX user_search (_date, _user)
)Engine=InnoDB;