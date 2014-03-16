insert into data_category (id, name) values (1, 'Book');
insert into data_category (id, name) values (2, 'Electronics');
insert into data_category (id, name) values (3, 'Other');

insert into data_condition (id, name, description) values (1, 'New', 'Item is new.');
insert into data_condition (id, name, description) values (2, 'AlmostNew', 'Item is almost new.');
insert into data_condition (id, name, description) values (3, 'Used', 'Item is used.');
insert into data_condition (id, name, description) values (4, 'Refurbished', 'Item is refurbished.');

insert into data_followedreason (id, name, description) values (1, 'Comment', 'User commented on the post');
insert into data_followedreason (id, name, description) values (2, 'Follow', 'User manually followed the post');	

insert into data_notification (id, name, description)
values (1, 'EmailNotification', 'Notify me by sending me an email' );
insert into data_notification (id, name, description)
values (2, 'NoNotification', 'Do not notify me');

insert into data_privacy (id, name, description)
values (1, 'Public', 'Everyone can see my profile.');
insert into data_privacy (id, name, description)
values (2, 'Private', 'No one can see my profile.');

insert into data_country (id, name, currency_code) values (1, 'USA', 'USD');
insert into data_country (id, name, currency_code) values (2, 'China', 'CNY');

insert into data_state (id, name, country_id) values (1, 'Washington', 1);
insert into data_state (id, name, country_id) values (2, 'California', 1);
insert into data_state (id, name, country_id) values (3, 'Guangdong', 2);
insert into data_state (id, name, country_id) values (4, 'Zhejiang', 2);

insert into data_city (id, name, state_id, country_id, image_url, image_selected_url)
values (1, 'Seattle', 1, 1, 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/seattle.png', 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/seattle_selected.png');
insert into data_city (id, name, state_id, country_id, image_url, image_selected_url) values (2, 'Beijing', null, 2, 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/beijing.png', 'https://s3-us-west-2.amazonaws.com/beike-s3/static/img/cities/beijing_selected.png');

insert into data_address (id, street_line_1, street_line_2, city_id, zip_code, latitude, longitude)
values (1, '535 Terry Ave N', 'Apt 100', 1, 98109, null, null);

insert into data_user (id, name, gender, wx_id, wx_name, qq_number, mobile_phone, home_phone, email,
                       address_id, notification_id, privacy_id, image_url)
values (1, 'beike_user', 1, 'test1234', 'HelloWorld', null, null, null, 'beike@123.com', 1, 1, 1, null);
