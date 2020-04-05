create table providerBasedUserApplets
(
    userId   int                          not null,
    appletId int                          not null,
    config   longtext collate utf8mb4_bin null,
    constraint providerBasedUserApplets_userId_appletId_uindex
        unique (userId, appletId),
    constraint providerBasedUserApplets_applets_id_fk
        foreign key (appletId) references ifttt.applets (id),
    constraint providerBasedUserApplets_users_id_fk
        foreign key (userId) references ifttt.users (id)
            on delete cascade,
    constraint config
        check (json_valid(`config`))
);

rename table userApplets to scheduleBasedUserApplets;

alter table providerBasedUserApplets
    add token char(64) not null;

create unique index providerBasedUserApplets_token_uindex
    on providerBasedUserApplets (token);


