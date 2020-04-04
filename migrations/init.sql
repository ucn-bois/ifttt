create table actions
(
    id   int auto_increment
        primary key,
    name varchar(64) not null,
    constraint actions_name_uindex
        unique (name)
);

insert into actions (id, name) values (1, 'forgot-password');
insert into actions (id, name) values (2, 'email-verification');

create table providers
(
    id      int auto_increment
        primary key,
    name    varchar(255) not null,
    authUrl varchar(255) not null,
    constraint providers_authUrl_uindex
        unique (authUrl),
    constraint providers_name_uindex
        unique (name)
);

insert into providers (id, name, authUrl) values (1, 'dropbox', 'https://www.dropbox.com/oauth2/authorize?client_id=bqac1w42q5ef0p4&response_type=code&redirect_uri=http://207.154.248.85/providers/dropbox/authorize');
insert into providers (id, name, authUrl) values (2, 'github', 'https://github.com/login/oauth/authorize?client_id=6433b4b5cf4bcbb2c8f1&redirect_uri=http://207.154.248.85/providers/github/authorize');


create table applets
(
    id          int auto_increment
        primary key,
    name        varchar(255)                 not null,
    description text                         not null,
    script      varchar(255)                 not null,
    parameters  longtext collate utf8mb4_bin null,
    providerId  int                          null,
    constraint applets_name_uindex
        unique (name),
    constraint applets_script_uindex
        unique (script),
    constraint applets_providers_id_fk
        foreign key (providerId) references providers (id)
            on delete cascade,
    constraint parameters
        check (json_valid(`parameters`))
);

insert into applets (id, name, description, script, parameters, providerId) values (1, 'Weather forecast at 6AM every day', 'Get a daily weather forecast at 6AM every day for your location.', 'weather-forecast-6am', '["location"]', null);
insert into applets (id, name, description, script, parameters, providerId) values (2, 'Greeting', 'Warm hello right to your console. Makes your day better!', 'greeting', '["greeting"]', null);
insert into applets (id, name, description, script, parameters, providerId) values (3, 'Dropbox watcher', 'Get an email whenever there is a change on your Dropbox space!', 'dropbox-watcher', '[]', 1);

create table users
(
    id         int auto_increment
        primary key,
    username   varchar(255)         not null,
    email      varchar(255)         not null,
    password   char(60)             not null,
    isVerified tinyint(1) default 0 not null,
    constraint users_email_uindex
        unique (email),
    constraint users_username_uindex
        unique (username)
);

create table userApplets
(
    userId    int                          not null,
    appletId  int                          not null,
    token     char(64)                     not null,
    config    longtext collate utf8mb4_bin null,
    cronJobId int                          not null,
    constraint userApplets_cronJobId_uindex
        unique (cronJobId),
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

create table userProviders
(
    userId     int                          not null,
    providerId int                          not null,
    token      varchar(255)                 not null,
    parameters longtext collate utf8mb4_bin null,
    constraint userProviders_userId_providerId_uindex
        unique (userId, providerId),
    constraint userProviders_providers_id_fk
        foreign key (providerId) references providers (id)
            on delete cascade,
    constraint userProviders_users_id_fk
        foreign key (userId) references users (id)
            on delete cascade,
    constraint parameters
        check (json_valid(`parameters`))
);

create table userRequests
(
    userId   int                  not null,
    actionId int                  not null,
    token    char(32)             not null,
    isUsed   tinyint(1) default 0 not null,
    constraint userRequests_token_uindex
        unique (token),
    constraint userRequests_actions_id_fk
        foreign key (actionId) references actions (id)
            on delete cascade,
    constraint userRequests_users_id_fk
        foreign key (userId) references users (id)
            on delete cascade
);

