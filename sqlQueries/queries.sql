CREATE TABLE dashboardUsers
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    profile_pic VARCHAR(800),
    fullname VARCHAR(200),
    email VARCHAR(100),
    phone VARCHAR(15),
    user_role VARCHAR(50),
    user_password VARCHAR(100),
    referrer_id VARCHAR(100),
    session_token VARCHAR(1024),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL,
    UNIQUE (email)
);

CREATE TABLE userTabAccess
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    userid integer,
    fieldvisits VARCHAR(10),
    projectRescue VARCHAR(10),
    projectGobiShelter VARCHAR(10),
    projectAdmittedToOtherHomes VARCHAR(10),
    projectRehabilitationHomeClients VARCHAR(10),
    projectRehabilitationHomeActivityTracker VARCHAR(10),
    projectRehabilitationHomeFoodMenu VARCHAR(10),
    projectRehabilitationHomeVisitors VARCHAR(10),
    projectECRC VARCHAR(10),
    project5A VARCHAR(10),
    projectAwarenessProgram VARCHAR(10),
    projectHumanitarianServices VARCHAR(10),
    outPatientServices VARCHAR(10),
    profilesClients VARCHAR(10),
    profilesVolunteers VARCHAR(10),
    profilesInformers VARCHAR(10),
    profilesOtherHomes VARCHAR(10),
    profilesStaffs VARCHAR(10),
    programTimelines VARCHAR(10),
    enquiries VARCHAR(10),
    reports VARCHAR(10),

    CONSTRAINT fk_product
    FOREIGN KEY (userid)
    REFERENCES dashboardUsers(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE fieldVisits
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    ot_regno VARCHAR(50),
    outreach_date VARCHAR(50),
    client_name VARCHAR(100),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(200),
    type_of_addiction VARCHAR(200),
    cause_of_beginning VARCHAR(200),
    income_from_begging VARCHAR(50),
    education_qualification VARCHAR(200),
    location_address VARCHAR(400),
    client_pic VARCHAR(800),
    service_providing_details VARCHAR(400),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectRescue
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    regno VARCHAR(50),
    rescue_date VARCHAR(100),
    client_name VARCHAR(100),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(400),
    rescue_location VARCHAR(400),
    education_qualification VARCHAR(200),
    id_proofs VARCHAR(100),
    family_details VARCHAR(400),
    social_reintegration VARCHAR(200),
    client_pic VARCHAR(800),
    attachments VARCHAR(800),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectGobiShelter
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    client_admission_no VARCHAR(50),
    admission_date VARCHAR(50),
    client_name VARCHAR(100),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(400),
    rescue_location VARCHAR(400),
    client_native VARCHAR(200),
    client_parent_details VARCHAR(100),
    id_proofs VARCHAR(400),
    attachments VARCHAR(800),
    client_pic VARCHAR(800),
    date_of_abscond VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectAdmittedToOtherHomes
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    ot_regno VARCHAR(50),
    outreach_date VARCHAR(50),
    admit_date VARCHAR(50),
    client_name VARCHAR(100),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(200),
    rescue_address VARCHAR(400),
    client_pic VARCHAR(800),
    home_name VARCHAR(400),
    home_address VARCHAR(800),
    staff_accommodation VARCHAR(800),
    volunteer_accommodation VARCHAR(800),
    first_month_follow_up VARCHAR(2048),
    second_month_follow_up VARCHAR(2048),
    third_month_follow_up VARCHAR(2048),
    fourth_month_follow_up VARCHAR(2048),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectRehabilitationHomeClients
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    client_admission_no VARCHAR(50),
    admission_date VARCHAR(50),
    client_name VARCHAR(100),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(400),
    rescue_location VARCHAR(400),
    client_native VARCHAR(200),
    client_parent_details VARCHAR(100),
    id_proofs VARCHAR(400),
    attachments VARCHAR(800),
    client_pic VARCHAR(800),
    date_of_abscond VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectRehabilitationHomeActivityTracker
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    regno VARCHAR(50),
    admission_date VARCHAR(100),
    client_name VARCHAR(100),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(400),
    rescue_location VARCHAR(400),
    family_details VARCHAR(400),
    food_taken VARCHAR(10),
    medicine_taken VARCHAR(10),
    exercise_status VARCHAR(10),
    grooming_status VARCHAR(10),
    abscond_date VARCHAR(100),
    social_reintegration VARCHAR(200),
    attachments VARCHAR(800),
    client_pic VARCHAR(800),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectRehabilitationHomeFoodMenu
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    week_day VARCHAR(10),
    breakfast VARCHAR(200),
    lunch VARCHAR(200),
    dinner VARCHAR(200),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    color_code VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectRehabilitationHomeVisitors
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    visitor_name VARCHAR(200),
    date_of_visit VARCHAR(200),
    visitor_designation VARCHAR(100),
    place_of_visit VARCHAR(400),
    staff_attended VARCHAR(200),
    pupose_of_visit VARCHAR(400),
    contact_no VARCHAR(100),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectECRC
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    client_admission_no VARCHAR(50),
    admission_date VARCHAR(50),
    client_name VARCHAR(200),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(200),
    type_of_disorder VARCHAR(200),
    type_of_diagnosis VARCHAR(400),
    rescue_location VARCHAR(400),
    client_native VARCHAR(200),
    client_parent_details VARCHAR(300),
    id_proofs VARCHAR(400),
    client_pic VARCHAR(800),
    treatment_taken VARCHAR(400),
    medicine_taken VARCHAR(400),
    skill_development_provided VARCHAR(400),
    attachments VARCHAR(800),
    rehabilitation_status VARCHAR(200),
    date_of_abscond VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE gallery
(
    gallery_id BIGSERIAL PRIMARY KEY NOT NULL,
    photo_urls text[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projectAwarenessProgram
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    program_date VARCHAR(50),
    program_id VARCHAR(50),
    event_name VARCHAR(200),
    event_description VARCHAR(500),
    program_location VARCHAR(500),
    participant_count VARCHAR(500),
    gallery_id VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE project5A
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    program_date VARCHAR(50),
    program_id VARCHAR(50),
    event_name VARCHAR(200),
    event_description VARCHAR(500),
    program_location VARCHAR(500),
    participant_count VARCHAR(500),
    gallery_id VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE projectHumanitarianServices
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    program_date VARCHAR(50),
    program_id VARCHAR(50),
    event_name VARCHAR(200),
    event_description VARCHAR(500),
    program_location VARCHAR(500),
    participant_count VARCHAR(500),
    gallery_id VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE outPatientServices
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    informer_id VARCHAR(50),
    informer_date VARCHAR(50),
    op_person_name VARCHAR(200),
    age VARCHAR(50),
    gender VARCHAR(50),
    health_condition VARCHAR(200),
    consent_relative VARCHAR(200),
    informer_contact_detail VARCHAR(200),
    informer_location VARCHAR(500),
    informer_relationship VARCHAR(500),
    client_pic VARCHAR(800),
    attachments VARCHAR(800),
    action_taken VARCHAR(500),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE profilesClients
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    client_id VARCHAR(50),
    client_name VARCHAR(200),
    age VARCHAR(3),
    gender VARCHAR(10),
    health_condition VARCHAR(300),
    rescue_address VARCHAR(200),
    client_pic VARCHAR(800),
    current_status VARCHAR(200),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE profilesVolunteers
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    volunteer_name VARCHAR(200),
    age VARCHAR(8),
    gender VARCHAR(16),
    education_qualification VARCHAR(200),
    father_name VARCHAR(200),
    location_address VARCHAR(200),
    blood_group VARCHAR(200),
    volunteer_pic VARCHAR(800),
    email VARCHAR(100),
    fb_acc VARCHAR(800),
    insta_acc VARCHAR(800),
    linkedin_acc VARCHAR(800),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE profilesInformers
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    informer_id VARCHAR(50),
    date_of_info VARCHAR(20),
    informer_name VARCHAR(200),
    contact_details VARCHAR(100),
    informer_designation VARCHAR(200),
    informer_native VARCHAR(200),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE profilesOtherHomes
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    home_name VARCHAR(200),
    home_location VARCHAR(500),
    home_specialist VARCHAR(300),
    founder_name VARCHAR(200),
    gallery_id VARCHAR(50),
    home_contact_no VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE profilesStaffs
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    volunteer_name VARCHAR(200),
    volunteer_pic VARCHAR(800),
    age VARCHAR(8),
    gender VARCHAR(16),
    email VARCHAR(20),
    father_name VARCHAR(200),
    education_qualification VARCHAR(200),
    blood_group VARCHAR(200),
    location_address VARCHAR(200),
    fb_acc VARCHAR(800),
    insta_acc VARCHAR(800),
    linkedin_acc VARCHAR(800),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE programTimelines
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    program_date VARCHAR(50),
    program_id VARCHAR(50),
    event_name VARCHAR(200),
    event_description VARCHAR(500),
    program_location VARCHAR(500),
    participant_count VARCHAR(500),
    gallery_id VARCHAR(50),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE enquiries
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    gc_register_number VARCHAR(50),
    enquire_date VARCHAR(50),
    caller_name VARCHAR(200),
    caller_location VARCHAR(400),
    caller_phone_no VARCHAR(200),
    homeless_person_name VARCHAR(400),
    age VARCHAR(3),
    gender VARCHAR(10),
    health_condition VARCHAR(400),
    homeless_person_location VARCHAR(400),
    pic VARCHAR(800),
    service_providing_details VARCHAR(800),
    volunteer_accommodation VARCHAR(2048),
    approval_status VARCHAR(50),
    admin_remarks VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE alerts
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    alert_pic VARCHAR(800),
    alert_name VARCHAR(200),
    alert_description VARCHAR(400),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sort_order SERIAL
);

CREATE TABLE tableHeaders
(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    table_name VARCHAR(200),
    headers text[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Table Headers

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'fieldVisitsHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'S.No',
    'Date',
    'Homeless Person Name',
    'Age',
    'Gender',
    'Health Condition',
    'Type of Addiction',
    'Cause of Beginning',
    'Income from Begging',
    'Education Qualification',
    'Location',
    'Photo',
    'Service Providing Details'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'projectRescueHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'S.No',
    'Rescue Date',
    'Rescue Person Name',
    'Age',
    'Gender',
    'Health Condition',
    'Rescue Place',
    'Educational Qualification',
    'Identification',
    'Family Details',
    'Social Reintegration',
    'Photo',
    'Attachments'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'projectGobiShelterHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'Client Admission No',
    'Admission Date',
    'Client’s Name',
    'Age',
    'Gender',
    'Health Condition',
    'Rescue Location',
    'Client Native',
    'Client’s Parents Details',
    'ID Proofs',
    'Photo',
    'Attachments',
    'Date of Abscond'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'projectRehabilitationHomeClientsHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'Client Admission No',
    'Admission Date',
    'Client’s Name',
    'Age',
    'Gender',
    'Health Condition',
    'Rescue Location',
    'Client Native',
    'Client’s Parents Details',
    'ID Proofs',
    'Photo',
    'Attachments',
    'Date of Abscond'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'projectRehabilitationHomeActivityTrackerHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'S.no',
    'Admission Date',
    'Name',
    'Age',
    'Gender',
    'Health Condition',
    'Rescue Place',
    'Family Details',
    'Food Taken',
    'Medicine Taken',
    'Therapy Taken',
    'Grooming Taken',
    'Abscond Date',
    'Reintegration Status',
    'Attachments',
    'Residence Photo'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'projectRehabilitationHomeVisitorsHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'Visitor’s Name',
    'Date of Visit',
    'Visitor’s Designation',
    'Place of Visit',
    'Staff Attended',
    'Purpose of Visit',
    'Contact No'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'projectECRCHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'Client Admission No',
    'Admission Date',
    'Client’s Name',
    'Age',
    'Gender',
    'Health Condition',
    'Type of Disorder',
    'Type of Diagnosis',
    'Rescue Location',
    'Client Native',
    'Client’s Parents Details',
    'ID Proofs',
    'Photo',
    'Treatment Taken',
    'Medicine Taken',
    'Skill Development Provided',
    'Attachments',
    'Rehabilitation Status',
    'Date of abscond'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'outPatientServicesHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'S.no',
    'Date',
    'Op Person Name',
    'Age',
    'Gender',
    'Health Condition',
    'Consent Relatives',
    'Relative Contact Number',
    'Relative Address',
    'Relationship for beneficiary',
    'Photo',
    'Id proof Attachments',
    'Action Taken'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'enquiriesHeaders',
    ARRAY[
     'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'S.no',
    'Date',
    'Informer Name',
    'Informer Address',
    'Informer Contact Number',
    'Homeless Person Name',
    'Age',
    'Gender',
    'Health Condition',
    'Homeless Person Location',
    'Homeless Photo',
    'Service Providing Details',
    'Volunteer Accommodation'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'profilesInformersHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'S.no',
    'Date',
    'Informer’s Name',
    'Informer’s Contact Number',
    'Informer’s Designation',
    'Informer’s Address'
    ]
);

INSERT INTO tableHeaders (table_name, headers)
VALUES (
    'projectAdmittedToOtherHomesHeaders',
    ARRAY[
    'Select Action',
    'Approval Status',
    'Admin Remarks',
    'Record Created On',
    'S.no',
    'Date of Rescue',
    'Rescue Person Name',
    'Age',
    'Gender',
    'Health Condition',
    'Rescue Place',
    'Photo',
    'Admitted Home Name',
    'Home Address',
    'Date of Admit',
    'Staff Accommodation',
    'Volunteer Accommodation',
    '1st follow up',
    '2nd follow up',
    '3rd follow up',
    '4th follow up'
    ]
);

-- Indexing Tables

CREATE INDEX idx_fieldvisits
ON fieldvisits (
    id,
    ot_regno,
    outreach_date,
    client_name,
    age,
    gender,
    health_condition,
    type_of_addiction,
    cause_of_beginning,
    income_from_begging,
    education_qualification,
    location_address,
    client_pic,
    service_providing_details,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_projectrescue
ON projectRescue (
    id,
    regno,
    rescue_date,
    client_name,
    age,
    gender,
    health_condition,
    rescue_location,
    education_qualification,
    id_proofs,
    family_details,
    social_reintegration,
    client_pic,
    attachments,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_projectgobishelter
ON projectGobiShelter (
    id,
    client_admission_no,
    admission_date,
    client_name,
    age,
    gender,
    health_condition,
    rescue_location,
    client_native,
    client_parent_details,
    id_proofs,
    attachments,
    client_pic,
    date_of_abscond,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_admittedtootherhomes
ON projectAdmittedToOtherHomes (
    id,
    ot_regno,
    outreach_date,
    admit_date,
    client_name,
    age,
    gender,
    health_condition,
    rescue_address,
    client_pic,
    home_name,
    home_address,
    staff_accommodation,
    volunteer_accommodation,
    first_month_follow_up,
    second_month_follow_up,
    third_month_follow_up,
    fourth_month_follow_up,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_rehabilitationhomeclients
ON projectRehabilitationHomeClients (
    id,
    client_admission_no,
    admission_date,
    client_name,
    age,
    gender,
    health_condition,
    rescue_location,
    client_native,
    client_parent_details,
    id_proofs,
    attachments,
    client_pic,
    date_of_abscond,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_rehabilitationhomeactivitytracker
ON projectRehabilitationHomeActivityTracker (
    id,
    regno,
    admission_date,
    client_name,
    age,
    gender,
    health_condition,
    rescue_location,
    family_details,
    food_taken,
    medicine_taken,
    exercise_status,
    grooming_status,
    abscond_date,
    social_reintegration,
    attachments,
    client_pic,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_rehabilitationhomefoodmenu
ON projectRehabilitationHomeFoodMenu (
    id,
    week_day,
    breakfast,
    lunch,
    dinner,
    approval_status,
    admin_remarks,
    color_code,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_rehabilitationhomevisitors
ON projectRehabilitationHomeVisitors (
    id,
    visitor_name,
    date_of_visit,
    visitor_designation,
    place_of_visit,
    staff_attended,
    pupose_of_visit,
    contact_no,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_projectecrc
ON projectECRC (
    id,
    client_admission_no,
    admission_date,
    client_name,
    age,
    gender,
    health_condition,
    type_of_disorder,
    type_of_diagnosis,
    rescue_location,
    client_native,
    client_parent_details,
    id_proofs,
    client_pic,
    treatment_taken,
    medicine_taken,
    skill_development_provided,
    attachments,
    rehabilitation_status,
    date_of_abscond,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_gallery
ON gallery (
    gallery_id,
    photo_urls,
    created_at
);

CREATE INDEX idx_covering_projectawarenessprogram
ON projectAwarenessProgram (
    id,
    program_date,
    program_id,
    event_name,
    event_description,
    program_location,
    participant_count,
    gallery_id,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_project5a
ON project5A (
    id,
    program_date,
    program_id,
    event_name,
    event_description,
    program_location,
    participant_count,
    gallery_id,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_projecthumanitarianservices
ON projectHumanitarianServices (
    id,
    program_date,
    program_id,
    event_name,
    event_description,
    program_location,
    participant_count,
    gallery_id,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_outpatientservices
ON outPatientServices (
    id,
    informer_id,
    informer_date,
    op_person_name,
    age,
    gender,
    health_condition,
    consent_relative,
    informer_contact_detail,
    informer_location,
    informer_relationship,
    client_pic,
    attachments,
    action_taken,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_profilesclients
ON profilesClients (
    id,
    client_id,
    client_name,
    age,
    gender,
    health_condition,
    rescue_address,
    client_pic,
    current_status,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_profilesvolunteers
ON profilesVolunteers (
    id,
    volunteer_name,
    volunteer_pic,
    age,
    gender,
    email,
    father_name,
    education_qualification,
    blood_group,
    location_address,
    fb_acc,
    insta_acc,
    linkedin_acc,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_profilesinformers
ON profilesInformers (
    id,
    informer_id,
    date_of_info,
    informer_name,
    contact_details,
    informer_designation,
    informer_native,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_profilesotherhomes
ON profilesOtherHomes (
    id,
    home_name,
    home_location,
    home_specialist,
    founder_name,
    gallery_id,
    home_contact_no,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_profilesstaffs
ON profilesStaffs (
    id,
    volunteer_name,
    volunteer_pic,
    age,
    gender,
    email,
    father_name,
    education_qualification,
    blood_group,
    location_address,
    fb_acc,
    insta_acc,
    linkedin_acc,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_programtimelines
ON programTimelines (
    id,
    program_date,
    program_id,
    event_name,
    event_description,
    program_location,
    participant_count,
    gallery_id,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);

CREATE INDEX idx_covering_enquiries
ON enquiries (
    id,
    gc_register_number,
    enquire_date,
    caller_name,
    caller_location,
    caller_phone_no,
    homeless_person_name,
    age,
    gender,
    health_condition,
    homeless_person_location,
    pic,
    service_providing_details,
    volunteer_accommodation,
    approval_status,
    admin_remarks,
    created_at,
    sort_order
);
