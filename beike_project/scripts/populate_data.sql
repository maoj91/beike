insert into data_category (name) values ('Book');
insert into data_category (name) values ('Electronics');
insert into data_category (name) values ('Other');

insert into data_condition (name, description) values ('New', 'Item is new.');
insert into data_condition (name, description) values ('AlmostNew', 'Item is almost new.');
insert into data_condition (name, description) values ('Used', 'Item is used.');
insert into data_condition (name, description) values ('Refurbished', 'Item is refurbished.');


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

insert into data_city (name, state_id, country_id, image_url, image_selected_url)
select 'Seattle', id, country_id, 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/seattle.png', 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/seattle_selected.png'
from data_state where name='Washington';

insert into data_city (name, state_id, country_id, image_url, image_selected_url)
select 'Beijing', null, id, 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/beijing.png', 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/beijing_selected.png'
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
