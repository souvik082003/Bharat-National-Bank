```mermaid
erDiagram

    BANK {
        int Bank_Code
        string Name
        string Headquarters
    }

    BRANCH {
        int Branch_Code
        string Branch_Name
        string City
        int Bank_Code
    }

    CUSTOMER {
        int Cust_ID
        string Name
        string Address
        string Phone
        string Email
        date DOB
    }

    ACCOUNT {
        int Account_No
        string Acc_Type
        float Balance
        int Cust_ID
        int Branch_Code
    }

    LOAN {
        int Loan_ID
        string Loan_Type
        float Amount
        int Cust_ID
        int Branch_Code
    }

    CUSTOMER_LOAN {
        int Cust_ID
        int Loan_ID
        string Status
    }

    TRANSFERS {
        int Transfer_ID
        int From_Account
        int To_Account
        float Amount
        datetime Date
    }

    BILL_PAYMENTS {
        int Payment_ID
        int Account_No
        string Biller_Name
        string Category
        float Amount
        datetime Date
    }

    SAVED_BILLERS {
        int Biller_ID
        int Cust_ID
        string Biller_Name
        string Category
    }

    %% --- Relationships ---
    BANK ||--o{ BRANCH : has
    BRANCH ||--o{ ACCOUNT : contains
    BRANCH ||--o{ LOAN : processes
    CUSTOMER ||--o{ ACCOUNT : owns
    CUSTOMER ||--o{ LOAN : applies_for
    CUSTOMER ||--o{ SAVED_BILLERS : saves
    ACCOUNT ||--o{ TRANSFERS : initiates
    ACCOUNT ||--o{ BILL_PAYMENTS : makes
    LOAN ||--o{ CUSTOMER_LOAN : linked_to


   
