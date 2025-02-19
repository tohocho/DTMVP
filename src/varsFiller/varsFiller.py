import json #Imports JSON module to be able to read JSON file
import os #Imports the 'os' module to access environment variables

def load_json(file_path): #Path where is located the JSON file
    try:
        with open(file_path, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        print("JSON file not found. Creating a new one.")
        return {}

def get_pipeline_variables(): #Variables that needs to be accessed in the pipline
    variables = {
        "environment": os.getenv("ENVIRONMENT", "default_env"),
        "product": os.getenv("PRODUCT", "default_product"),
        "shortClientName": os.getenv("SHORT_CLIENT_NAME", "default_short_client"),
        "clientName": os.getenv("CLIENT_NAME", "default_client"),
        "region": os.getenv("REGION", "default_region")
    }
    return variables

#Dictionary whit application names and versions, this are constants, no need to check against
appServiceVersions = {
    'AppService_App1': '1.1.0',
    'AppService_App2': '1.1.0',
    'AppService_App3': '1.1.0',
    'AppService_App4': '1.1.0',
    'AppService_App5': '1.1.0',
    'AppService_App6': '1.1.0',
    'AppService_App7': '1.1.0',
    'AppService_App8': '1.1.0',
    'AppService_App9': '1.1.0',
    'AppService_App10': '1.1.0',
    'AppService_App11': '1.1.0',
    'AppService_App12': '1.1.0',
    'AppService_App13': '1.1.0',
    'AppService_App14': '1.1.0',
    'AppService_App15': '1.1.0',
    'AppService_App16': '1.1.0',
    'AppService_App17': '1.1.0',
    'AppService_App18': '1.1.0',
    'AppService_App19': '1.1.0',
    'AppService_App20': '1.1.0',
    'AppService_App21': '1.1.0',
    'AppService_App22': '1.1.0',
    'AppService_App23': '1.1.0',
    'AppService_App24': '1.1.0',
    'AppService_App25': '1.1.0',
    'AppService_App26': '1.1.0',
    'AppService_App27': '1.1.0',
    'AppService_App28': '1.1.0',
    'AppService_App29': '1.1.0',
    'AppService_App30': '1.1.0',
    'AppService_App31': '1.1.0',
    'AppService_App32': '1.1.0',
    'AppService_App33': '1.1.0',
    'AppService_App34': '1.1.0',
    'AppService_App35': '1.1.0'
}

def save_json(data, file_path): #Save new JSON
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

def main(): #Main procees, where the 
    json_file = "artifact.json"  # Replace with artifact real path

    save_json(data, json_file) # JSON write

if __name__ == "__main__":
    main()