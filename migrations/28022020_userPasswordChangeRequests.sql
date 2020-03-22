create table userPasswordChangeRequests
(
    userId int not null,
    token varchar(64) not null,
    isValid boolean default true not null,
    constraint userPasswordChangeRequests_users_id_fk
        foreign key (userId) references users (id)
            on delete cascade
);

create unique index userPasswordChangeRequests_token_uindex
    on userPasswordChangeRequests (token);

