create table users
(
    id       int auto_increment primary key,
    username varchar(255) not null,
    email    varchar(255) not null,
    password char(60)     not null,
    constraint users_email_uindex unique (email),
    constraint users_username_uindex unique (username)
);