export type AuthUser = 
    {
     email: string;
     email_verified: boolean;
     username: string;
     phone_number: string;
     phone_verified: boolean;
     user_id: string;
     created_at: string;
     updated_at: string;
     identities: [
        {
          connection: string;
          user_id: string;
          provider: string;
          isSocial: boolean;
        }
      ],
     app_metadata: {},
     user_metadata: {},
     picture: string;
     name: string;
     nickname: string;
     multifactor: string[];
     last_ip: string;
     last_login: string;
     logins_count: number;
     blocked: boolean;
     given_name: string;
     family_name: string;
    }
  