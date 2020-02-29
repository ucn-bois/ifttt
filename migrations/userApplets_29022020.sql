alter table userApplets
    add cronJobId int not null,
    modify token char(64) not null;

create unique index userApplets_cronJobId_uindex
    on userApplets (cronJobId);