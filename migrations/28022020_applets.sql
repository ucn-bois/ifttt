create table applets
(
    id          int auto_increment
        primary key,
    name        varchar(255) not null,
    description text         not null,
    script      varchar(255) not null,
    constraint applets_name_uindex
        unique (name),
    constraint applets_script_uindex
        unique (script)
);

create table userApplets
(
    userId   int                          not null,
    appletId int                          not null,
    token    char(32)                     not null,
    config   longtext collate utf8mb4_bin null,
    constraint userApplets_token_uindex
        unique (token),
    constraint userApplets_userId_appletId_uindex
        unique (userId, appletId),
    constraint userApplets_applets_id_fk
        foreign key (appletId) references applets (id)
            on delete cascade,
    constraint userApplets_users_id_fk
        foreign key (userId) references users (id)
            on delete cascade,
    constraint config
        check (json_valid(`config`))
);