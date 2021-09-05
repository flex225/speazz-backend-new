CREATE TABLE users (
    id int primary key AUTO_INCREMENT,
    uuid varchar(255),
    name varchar(255)
);

CREATE TABLE locations (
    id int primary key AUTO_INCREMENT,
    name varchar(255),
    google_id varchar(255)
);

CREATE TABLE users_locations (
    user_id int,
    location_id int,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);