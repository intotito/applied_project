# MySQL Database using InnoDB engine

DROP DATABASE IF EXISTS DATA_BANK;

CREATE DATABASE DATA_BANK;

USE DATA_BANK;

DROP TABLE IF EXISTS Stats;

DROP TABLE IF EXISTS Syncs;
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
    fm_avg_trk_time INT, 
    fm_accuracy FLOAT,
    vx_avg_res_time INT, 
    vx_shot_accuracy FLOAT, 
    vx_trg_accuracy FLOAT, 
    au_avg_res_timex INT, 
    bm_HR_max INT, 
    bm_HR_avg INT, 
    bm_HR_var FLOAT, 
    bm_act_steps INT,
    bm_sleep FLOAT,

    PRIMARY KEY (_id),
    INDEX user_search (_date, _user),
    CONSTRAINT sync_relation
    FOREIGN KEY sync_foreign_key (_user) REFERENCES Syncs (user_id) 
)Engine=InnoDB;

