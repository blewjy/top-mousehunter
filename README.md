# Mousehunt Bot

## Use Cases:

1. User registers HitGrab Mousehunt account via Telegram command. By default, bot will start running upon creation.
2. User starts Mousehunt bot via Telegram command.
3. User stops Mousehunt bot via Telegram command.
4. User stops Mousehunt bot for a specified length of time via Telegram command. After which, bot automatically resumes.
5. User gets account information via Telegram command. (Account name, account ID, rank, current location, current trap setup, current cheese, current gold, etc.)
6. User gets daily/12hrly/6hrly/3hrly/custom interval summary report of hunt statistics (number of horn sounds, mice caught, number of misses, etc.)


## Services

- Telegram Adapter
  - Acts as frontend for user.
  - Accepts commands from user and processes them.
  - Sends updates to users, such as daily reports.



                                   User
                                    |
                                    |
                              Telegram Adapter <----------
                                    |                    |
                                    |                    |
                            Scheduler Service (Go)       |
                             |            |       |      |
                             |            |       |      |
Captcha Service <---> Bot Service (Node)  |     Reporting Service
     (Python)                |            |       |
                             |            |       |
                            Database Service (Java)
                                    |
                                    |
                                Database (Postgres)



