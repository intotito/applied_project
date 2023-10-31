# Data Science

## Database Design

Questions to be answered for the design of the database. 
- Where will the database reside?
- How does the database sync?
- When does the database sync?
- Is there an efficient way to sync the database without checking every possible values?

### Where will the database reside

Given the architecture of the system, there are two possiblities regards to hosting the database. Before delving into the possibilities
it is important to highlight the contraints and limitations in the context of the project. 

#### Constraints & Limitations

    - The server end of the system architecture will be hosted on an Amazon EC2 Virtual machine running on Ubuntu 20.0.15 operating system. 
    - All charges and limited free usage policies of Amazon Cloud are applicable. 
    - The cost metrics is based on CPU usage and storage utilization. 
    - Cost is of paramount importance as the project has no budgetry allocation for any extra cost.

Now to the question posed earlier on, the following section describes the consideration and decision process that led to the chosen configuration. 
There are two viable options for hosting the database, these options are described below:
-   Hosting the database inside the Amazon EC2 Virtual machine. 
    This will involve installing the database server in the virtual machine where all the database operations requiring CPU usage will be done within the virtual machine. This will likley cause a peak in CPU usage as many operations are expected to be done in the database. Amazon pricing policy does not discriminate between CPU usage done for Database base operation and any other operation. This architecture also means that the database is permenantly attached to a running web application acting as an intermediatary. 
-   Hosting the database as a separate module as an Amazon Relational Database Service. This is inline with Software Design Principles that 
    advocate for loose coupling between software componenets. This option comes with the benefit of a self managed
    database system that lets the user focus on business logic as opposed to administrative + business logic. Cost comparison between these two altervnatives seesms to favour the EC2 VM configuration in the medium to long term. However Amazon Relation Database Service is available in the free-tier category and thus offers limited free monthly usage of 750 hour and a SSD storage capaicty of 20GB.

Performance for both configurations are exepected to be on par. For the short-term, which is within the scope of this project, hosting the database as a sub module using Amazon Relational Database Service offers the most cost effective alternative and thus was considered the best option for the project. 

### How does the database sync?

The architecture of the overall system calls for the relational databse to be in sync with the Firestore database. Since the data is expected to be generated and pulled from the Desktop Application to the Firestore Database, it offers two options for syncing with the relational database which will be a new componenet in the overall system architecture. 
-   Firstly, 