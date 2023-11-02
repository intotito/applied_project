# MySQL Database using InnoDB engine

CREATE TABLE Stats (
    _id INT UNSIGNED AUTO_INCREMENT,
    _date DATETIME NOT NULL, 
    _user VARCHAR,
    fm_avg_trk_time INT, 
    fm_accuracy FLOAT,
    vx_avg_res_time INT, 
    vx_shot_accuracy FLOAT, 
    vx_trg_accuracy FLOAT, 
    au_avg_res_time INT, 
    bm_HR_max INT, 
    bm_HR_avg INT, 
    bm_HR_var FLOAT, 
    bm_act_steps INT,
    bm_sleep FLOAT

    PRIMARY KEY (_id),
    INDEX user_search (_date, _user),
    CONSTRAINT sync_relation
    FOREIGN KEY sync_foreign_key (_user) REFERENCES Syncs (user_id) 
)Engine=InnoDB;

CREATE TABLE Syncs (
    _id INT UNSIGNED AUTO_INCREMENT, 
    user_id VARCHAR, 
    class_id INT, 
    sync_date DATETIME
)Engine=InnoDB;