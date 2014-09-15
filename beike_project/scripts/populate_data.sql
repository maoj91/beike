insert into data_category (name) values ('居家');
insert into data_category (name) values ('数码');
insert into data_category (name) values ('户外');
insert into data_category (name) values ('美妆');
insert into data_category (name) values ('服饰');
insert into data_category (name) values ('母婴');
insert into data_category (name) values ('手工');
insert into data_category (name) values ('Geek');
insert into data_category (name) values ('设计');
insert into data_category (name) values ('其他');


insert into data_condition (name, description,value) values ('New', 'Item is new.',0);
insert into data_condition (name, description,value) values ('Almost New', 'Item is 90% new.',1);
insert into data_condition (name, description,value) values ('Used', 'Item is 70% new .',2);
insert into data_condition (name, description,value) values ('Old', 'Item is used.',3);


insert into data_privacy (name, description)
values ('Public', 'Everyone can see my profile.');
insert into data_privacy (name, description)
values ('Private', 'No one can see my profile.');

insert into data_country (name, currency_code) values ('United States', 'USD');
insert into data_country (name, currency_code) values ('China', 'CNY');

insert into data_state (name, country_id)
select 'Washington', id from data_country where name = 'United States';
insert into data_state (name, country_id)
select 'California', id from data_country where name = 'United States';
insert into data_state (name, country_id)
select 'Portland', id from data_country where name = 'United States';
insert into data_state (name, country_id)
select 'Guangdong', id from data_country where name = 'China';
insert into data_state (name, country_id)
select 'Zhejiang', id from data_country where name = 'China';

insert into data_city (name, state_id, country_id)
select 'Seattle', id, country_id
from data_state where name='Washington';

insert into data_city (name, state_id, country_id)
select 'Beijing', null, id
from data_country where name='China';

insert into data_district (name, city_id, first_level_district_id, zip_code)
select 'University District', id, null, '98105' from data_city where name='Seattle';
insert into data_district (name, city_id, first_level_district_id, zip_code)
select 'Ballard', id, null, '98117' from data_city where name='Seattle';
insert into data_district (name, city_id, first_level_district_id, zip_code)
select 'South Lake Union', id, null, '98109' from data_city where name='Seattle';

insert into data_address (street_line_1, street_line_2, city_id, zip_code, latlon)
select '535 Terry Ave N', 'Apt 100', id, '98109', null from data_city where name='Seattle';

insert into data_uservalidation(user_id,key) values ('test1234','test1234');
