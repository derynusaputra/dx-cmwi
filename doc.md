//admin
//admin123

//docker compose
//

kalau ada perubahan di code tinggal build aja
docker compose up -d --build

//jalankan proxy
https://localhost:8443/

operator
Username: operator
Password: operator123

Group Leader (gl)
Username: gl_painting
Password: gl123
Supervisor (svp)
Username: spv_painting
Password: spv123
Assistant Manager (amg)
Username: amg_painting
Password: amg123

requester (req)
Username: requester1
Password: req123

request manager (req_mg)
Username: remg_casting
Password: remg123

1. Pembuat Request (Dept: PE Casting)
   Username: requester1 | Pass: req123 (Membuat request awal)
   Username: sl_casting | Pass: sl123 (Approval Pertama - SL)
   Username: remg_casting | Pass: remg123 (Approval Kedua - Request Manager)
2. Pihak Quality Control (Dashboard & Tablet)
   Username: gl_qcr | Pass: gl123 (Menerima request & Assign Inspector)
   Username: ara_rm | Pass: insp123 (Inspector via Tablet - Start & Submit Report) (atau nurhadi, a_ginanjar)
   Username: spv_qcr | Pass: spv123 (Approval Ketiga - QC SPV)
   Username: amg_qcr | Pass: amg123 (Approval Final - QC AMG)

Group Leader (gl)
Supervisor (svp)
Assistant Manager (amg)
requester (req)
request manager (req_mg)

d-operator
pass: password
der-amg
password: password

d-svp
password: password  
d-amg
password: password

d-group-lead
password: password

d-request
password: [PASSWORD]

d-request-manager
password: [PASSWORD]
