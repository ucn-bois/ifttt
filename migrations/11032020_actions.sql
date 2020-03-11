drop table userPasswordChangeRequests;

create table actions
(
    id int auto_increment,
    name varchar(64) not null,
    constraint actions_pk
        primary key (id)
);

create unique index actions_name_uindex
    on actions (name);

insert into actions (id, name) VALUES (1, 'forgot-password');
insert into actions (id, name) VALUES (2, 'email-verification');

create table userRequests
(
    userId int not null,
    actionId int not null,
    token char(32) not null,
    isUsed boolean default false not null,
    constraint userRequests_actions_id_fk
        foreign key (actionId) references actions (id)
            on delete cascade,
    constraint userRequests_users_id_fk
        foreign key (userId) references users (id)
            on delete cascade
);

create unique index userRequests_token_uindex
    on userRequests (token);

alter table users
    add isVerified boolean default false not null;
