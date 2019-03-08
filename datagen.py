"""
Deal.Me data generator

This script generates large amounts of JSON data to initialize the Deal.Me
databases.
"""

import argparse
import json
import os.path
import random
import re
import time


###############################################################################
# Constants
###############################################################################
AUTH_DEFAULT_PASSWORD = "$2b$10$C.dyLagjPwAITI7tXQy00eecB.wFCPDgXCjdYEt7D8guySrupmbC6"

FILE_AUTH =  "auth.json"
FILE_DEALS = "deals.json"
FILE_MALLS = "malls.json"
FILE_TAGS =  "tags.json"
FILE_USERS = "users.json"

ID_COUNTER = random.randint(0, 2**24 - 1)

LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis "\
            + "mattis orci sed egestas congue. Donec consectetur mi vel "\
            + "turpis volutpat, eget pretium metus sagittis. Phasellus orci "\
            + "diam, molestie consectetur leo et, hendrerit tincidunt "\
            + "ligula. Morbi interdum mattis sem eu porttitor. In vitae "\
            + "vestibulum purus. Duis augue purus, bibendum sit amet maximus "\
            + "quis, auctor vel lectus. Maecenas convallis, nisi sed rutrum "\
            + "mattis, nisi tellus dictum ex, nec aliquam dui risus ut "\
            + "purus. Nulla tempus sem nec dui feugiat ultrices. Duis justo "\
            + "augue, ultrices eget lorem et, blandit convallis arcu. Morbi "\
            + "malesuada nunc at cursus tempus. Ut tempor a est sit amet "\
            + "suscipit."


###############################################################################
# Probabilities that a given value with be provided by a user/store
###############################################################################
PROBABILITY_AGE       = 0.5
PROBABILITY_GENDER    = 0.5
PROBABILITY_LOCATION  = 0.5
PROBABILITY_MNAME     = 0.25
PROBABILITY_SOCIAL    = 0.5
PROBABILITY_SOCIAL_FB = 0.5

PROBABILITY_LIMITED_DEAL   = 0.5
PROBABILITY_PARENT_COMPANY = 0.5


###############################################################################
# Databases - this data will be written to the appropriate JSON files
###############################################################################
DATABASE_AUTH  = []
DATABASE_DEALS = []
DATABASE_MALLS = []
DATABASE_TAGS  = []
DATABASE_USERS = []


###############################################################################
# Base date - the data in database entries will be based on this data
###############################################################################
# List of email providers
EMAILS = [
    "gmail.com", "yahoo.ca", "telus.net", "shaw.ca", "hotmail.com", "e.mail",
]

# First part of a mall's name
MALL_FIRST = [
    "Aberdeen", "Angola", "Ardent", "Argentina's Finest", "Avery",
    "Bernheim", "Beckam", "Borne", "Barnaby", "Beckman",
    "Commercial", "Cornellius", "Cadillac", "Cromwell", "Corderoy",
    "Derwitz", "Dobb", "Eucharyst", "Fairview", "Gugenheim", "Hagerty",
    "Hamilton", "Konroy", "Lorenz", "Lambert", "Main", "Norbert", "Park",
    "Romero", "Richmond", "Romell", "Smith", "Trumeter", "Tobias",
    "Uwe Bol", "Updog", "Vancouver", "Vermont", "Whistler",
]

# Second part of a mall's name
MALL_SECOND = [
    "Center", "Mall", "Place", "Plaza",
]

# List of the 100 most popular first names in the US
NAMES_FIRST = [
    "Michael",      "James",        "John",         "Robert",       "David",
    "William",      "Mary",         "Christopher",  "Joseph",       "Richard",
    "Daniel",       "Thomas",       "Matthew",      "Jennifer",     "Charles",
    "Anthony",      "Patricia",     "Linda",        "Mark",         "Elizabeth",
    "Joshua",       "Steven",       "Andrew",       "Kevin",        "Brian",
    "Barbara",      "Jessica",      "Jason",        "Susan",        "Timothy",
    "Paul",         "Kenneth",      "Lisa",         "Ryan",         "Sarah",
    "Karen",        "Jeffrey",      "Donald",       "Ashley",       "Eric",
    "Jacob",        "Nicholas",     "Jonathan",     "Ronald",       "Michelle",
    "Kimberly",     "Nancy",        "Justin",       "Sandra",       "Amanda",
    "Brandon",      "Stephanie",    "Emily",        "Melissa",      "Gary",
    "Edward",       "Stephen",      "Scott",        "George",       "Donna",
    "Jose",         "Rebecca",      "Deborah",      "Laura",        "Cynthia",
    "Carol",        "Amy",          "Margaret",     "Gregory",      "Sharon",
    "Larry",        "Angela",       "Maria",        "Alexander",    "Benjamin",
    "Nicole",       "Kathleen",     "Patrick",      "Samantha",     "Tyler",
    "Samuel",       "Betty",        "Brenda",       "Pamela",       "Aaron",
    "Kelly",        "Heather",      "Rachel",       "Adam",         "Christine",
    "Zachary",      "Debra",        "Katherine",    "Dennis",       "Nathan",
    "Christina",    "Julie",        "Jordan",       "Kyle",         "Anna",
]

# List of the 100 most popular last names in the US
NAMES_LAST = [
    "Smith",        "Johnson",      "Williams",     "Brown",        "Jones",
    "Garcia",       "Rodriguez",    "Miller",       "Martinez",     "Davis",
    "Hernandez",    "Lopez",        "Gonzalez",     "Wilson",       "Anderson",
    "Thomas",       "Taylor",       "Lee",          "Moore",        "Jackson",
    "Perez",        "Martin",       "Thompson",     "White",        "Sanchez",
    "Harris",       "Ramirez",      "Clark",        "Lewis",        "Robinson",
    "Walker",       "Young",        "Hall",         "Allen",        "Torres",
    "Nguyen",       "Wright",       "Flores",       "King",         "Scott",
    "Rivera",       "Green",        "Hill",         "Adams",        "Baker",
    "Nelson",       "Mitchell",     "Campbell",     "Gomez",        "Carter",
    "Roberts",      "Diaz",         "Phillips",     "Evans",        "Turner",
    "Reyes",        "Cruz",         "Parker",       "Edwards",      "Collins",
    "Stewart",      "Morris",       "Morales",      "Ortiz",        "Gutierrez",
    "Murphy",       "Rogers",       "Cook",         "Kim",          "Morgan",
    "Cooper",       "Ramos",        "Peterson",     "Gonzales",     "Bell",
    "Reed",         "Bailey",       "Chavez",       "Kelly",        "Howard",
    "Richardson",   "Ward",         "Cox",          "Ruiz",         "Brooks",
    "Watson",       "Wood",         "James",        "Mendoza",      "Gray",
    "Bennett",      "Alvarez",      "Castillo",     "Price",        "Hughes",
    "Vasquez",      "Sanders",      "Jimenez",      "Long",         "Foster",
]

# First part of a store's name
STORE_FIRST = [
    "All", "Aqua", "Aquatics", "Bath", "Bath and Body", "Children's",
    "Clothes", "Consumer", "Electronics", "Food", "Games", "Garden", "Home",
    "Kid's", "Mega", "Phone", "Real Canadian", "Something", "Sports", "Swim",
    "Tools", "Video", "Wall", "Warehouse", "Ye Olde",
]

# Second part of a store's name
STORE_SECOND = [
    "-mart", " Bodega", " Center", " Central", " City", " Depot", " Emporium",
    " Market", " Place", " Republic", " Shop", " Store", " Supermarket",
    " Superstore", " Warehouse", " Works",
]

# List of all accepted tags
TAGS = [
    "Clothing", "Men's Clothing", "Women's Clothing", "Children's Clothing",
    "Apparel", "Men's Apparel", "Women's Apparel", "Children's Apparel",
    "Footwear", "Men's Footwear", "Women's Footwear", "Children's Footwear",
    "Swimwear", "Men's Swimwear", "Women's Swimwear", "Children's Swimwear",
    "Sports Wear", "Men's Sports Wear", "Women's Sports Wear", "Children's Sports Wear",
    "Apparel", "Men's Apparel", "Women's Apparel", "Children's Apparel",
    "Apparel", "Men's Apparel", "Women's Apparel", "Children's Apparel",
    "Apparel", "Men's Apparel", "Women's Apparel", "Children's Apparel",
    "Games", "Video Games", "Board Games", "Tabletop Games",
    "Electronics", "Phones", "TVs", "Kitchen Appliences", "Cooking Utensils",
    "Hardware", "Power Tools", "Gunpla", "Weeb Stuff",
]


###############################################################################
# Class Definitions
###############################################################################
class Range(object):
    """
    Represents a range of values. Makes it a little more human-readable.
    """
    def __init__(self, val1, val2):
        self.min = min(val1, val2)
        self.max = max(val1, val2)
    #/def
#/class


class Auth(object):
    """
    An auth database entry.
    """
    def __init__(self, id, role):
        self.data = {
            "id": id,
            "role": role,
            "collection": "USERS" if role == "user" else "STORES",
            "password": AUTH_DEFAULT_PASSWORD,
        }
    #/def
#/class


class Deal(object):
    """
    A deal database entry that will automatically generate random data.
    """
    def __init__(self, id, mall, store, tags):
        self.data = {}
        self.data["id"] = id
        self.data["tags"] = random.choice(tags)
        self.data["isActive"] = True
        self.data["creationDate"] = int(time.time())
        self.data["expiryDate"] = int(time.time()) + random.randint(1, 14)*24*3600
        self.data["views"] = random.randint(0, 1000)
        self.data["claims"] = random.randint(0, 200)
        self.data["mall"] = mall
        self.data["store"] = store

        if random.random() < 0.5:
            self.data["format"] = "Percent"
            self.data["description"] = "{}% off your purchase".format(random.randrange(10,75,5))
        else:
            self.data["format"] = "Dollar"
            self.data["description"] = "${} off your purchase".format(random.randrange(10,50,5))
        #/if

        if random.random() < PROBABILITY_LIMITED_DEAL:
            self.data["usesLeft"] = random.randint(100, 1000)
        else:
            self.data["usesLeft"] = -1
        #/if
    #/def
#/class


class Store(object):
    """
    A store database entry that will automatically generate random data.
    """
    def __init__(self, id, mall, tag_range):
        tags = random_subset(DATABASE_TAGS, random.randint(tag_range.min, tag_range.max))

        self.data = {}
        self.data["id"] = id
        self.data["mall"] = mall
        self.data["location"] = [180*random.random() - 90, 360*random.random() - 180]
        self.data["name"] = random.choice(STORE_FIRST) + random.choice(STORE_SECOND)
        self.data["email"] = "noreply@" + self.data["name"].replace(" ","").lower() + ".com"
        self.data["tags"] =  [tag["id"] for tag in tags]
        self.data["description"] = LOREM_IPSUM

        if random.random() < PROBABILITY_PARENT_COMPANY:
            self.data["parentCompany"] = self.data["name"]
        #/if
    #/def
#/class


class User(object):
    """
    A user database entry that will automatically generate random data.
    """
    def __init__(self, id, tag_range):
        # Required values
        tags = random_subset(DATABASE_TAGS, random.randint(tag_range.min, tag_range.max))

        self.data = {}
        self.data["id"] = id
        self.data["first"] = random.choice(NAMES_FIRST)
        self.data["last"] =  random.choice(NAMES_LAST)
        self.data["tags"] =  [tag["id"] for tag in tags]
        self.data["provider"] = "email"
        self.data["email"] = "{}.{}{}@{}".format(self.data["first"],
                                                 self.data["last"],
                                                 int(id, 16) % 100,
                                                 random.choice(EMAILS))

        # Optional values
        if random.random() < PROBABILITY_MNAME:
            self.data["middle"] = random.choice(NAMES_FIRST)
        if random.random() < PROBABILITY_AGE:
            self.data["age"] = random.randint(16, 65)
        if random.random() < PROBABILITY_GENDER:
            self.data["gender"] = random.choice(["Male", "Female", "Other"])
        if random.random() < PROBABILITY_LOCATION:
            self.data["location"] = "Vancouver, BC"
        if random.random() < PROBABILITY_SOCIAL:
            self.data["token"] = random.randing(10**15, 10**32 - 1)
            if random.random() < PROBABILITY_SOCIAL_FB:
                self.data["provider"] = "Facebook"
            else:
                self.data["provider"] = "Google"
            #/if
        #/if
    #/def
#/class


###############################################################################
# Database Functions - prepare and write databases
###############################################################################
"""
Generate an ID using the stardard applied by MongoDB.

Return:
    Returns an ID compatible with MongoDB.

Note:
    Unless you've displeased RNGesus, then all IDs will be unique.
"""
def generate_id():
    global ID_COUNTER
    id = "{0:08x}{1:010x}{2:06x}".format(int(time.time()),
                                         random.randint(0, 2**40 - 1),
                                         ID_COUNTER)
    ID_COUNTER += 1
    return id
#/def


"""
Generate all databases.

Parameters:
    args    The parsed and formatted argument list from main()
"""
def generate_db(args):
    # Generate the databases. Ordering is imporant, so do not change this
    # unless you know what you're doing.
    generate_db_tags()
    generate_db_users(args.users, args.tag_range)
    generate_db_malls(args.malls, args.stores, args.deal_range, args.tag_range)

    # Now that we have generated the databases, we can write their data to
    # their respective JSON files
    with open(FILE_AUTH, "w") as auth_file:
        auth_file.write(json.dumps(DATABASE_AUTH, indent=2))
    with open(FILE_DEALS, "w") as auth_file:
        auth_file.write(json.dumps(DATABASE_DEALS, indent=2))
    with open(FILE_MALLS, "w") as auth_file:
        auth_file.write(json.dumps(DATABASE_MALLS, indent=2))
    with open(FILE_TAGS, "w") as auth_file:
        auth_file.write(json.dumps(DATABASE_TAGS, indent=2))
    with open(FILE_USERS, "w") as auth_file:
        auth_file.write(json.dumps(DATABASE_USERS, indent=2))
    #/with
#/def


"""
Randomly generate a specified number of malls and stores.

Parameteres:
    mall_count      The number of malls to generate
    store_count     The number of stores to generate
    deal_range      A range of the number of deals a store can offer
    tag_range       A range of the tags a store can identify with

Note:
    The number of stores will be evenly distributed among the malls
"""
def generate_db_malls(mall_count, store_count, deal_range, tag_range):
    global DATABASE_AUTH
    global DATABASE_DEALS
    global DATABASE_MALLS

    for _ in xrange(mall_count):
        mall_id = generate_id()
        db_entry = []

        # Required values
        mall = {}
        mall["id"] = mall_id
        mall["address"] = "123 Some Street, Vancouver, BC V3D 6Y0"
        mall["name"] = random.choice(MALL_FIRST) + " " + random.choice(MALL_SECOND)
        mall["tags"] = set()
        mall["numOfStores"] = int(store_count / mall_count)
        db_entry.append(mall)

        # Now add stores to the mall
        for _ in xrange(store_count):
            store_id = generate_id()

            auth = Auth(store_id, "store")
            store = Store(store_id, mall_id, tag_range)

            DATABASE_AUTH.append(auth.data)
            db_entry.append(store.data)

            # Need to gerenate deals for each store, too
            for _ in xrange(random.randint(deal_range.min, deal_range.max)):
                deal = Deal(generate_id(), mall_id, store_id, store.data["tags"])
                DATABASE_DEALS.append(deal.data)
            #/for
        #/for
        mall["tags"] = list(mall["tags"])

        # Update the counters so we get exactly as many stores and malls as we
        # want. Don't forget to actually add the entry to the database!
        mall_count -= 1
        store_count -= mall["numOfStores"]
        DATABASE_MALLS.append(db_entry)
    #/for
#/def


"""
Generate all tags.
"""
def generate_db_tags():
    global DATABASE_TAGS

    for tag in TAGS:
        id = generate_id()

        # Required values
        data = {}
        data["id"]  = id
        data["tag"] = tag

        DATABASE_TAGS.append(data)
    #/for
#/def


"""
Randomly generate a specified number of users for the user database.

Parameters:
    count       The number of random users to generate
    tag_range   A range of the tags a user can have
"""
def generate_db_users(count, tag_range):
    global DATABASE_AUTH
    global DATABASE_USERS

    for _ in xrange(count):
        id = generate_id()

        auth = Auth(id, "user")
        user = User(id, tag_range)

        DATABASE_AUTH.append(auth.data)
        DATABASE_USERS.append(user.data)
    #/for
#/def


###############################################################################
# Helper Functions
###############################################################################
"""
Set up argument parsing. Perform some error checking and formatting.

Return:
    Returns an parsed and formatted argument list. Returns None if
    there was an error parsing or formatting the argument list.
"""
def argument_setup():
    global FILE_AUTH
    global FILE_DEALS
    global FILE_MALLS
    global FILE_TAGS
    global FILE_USERS

    parser = argparse.ArgumentParser()
    parser.add_argument("-b", "--base-dir", type=str, default="",
                        help="Base directory where to save output files")
    parser.add_argument("-d", "--deal-range", type=str, default="3..10",
                        help="Range representing the number of deals any "\
                            +"store can offer (e.g. 3..10)")
    parser.add_argument("-m", "--malls", type=int, default=6,
                        help="Number of mall entries to generate")
    parser.add_argument("-s", "--stores", type=int, default=60,
                        help="Number of stores to generate")
    parser.add_argument("-t", "--tag-range", type=str, default="2..4",
                        help="Range representing the number of tags any user "\
                            +"or deal may identify with (e.g. 2..5)")
    parser.add_argument("-u", "--users", type=int, default=250,
                        help="Number of user entries to generate")
    args = parser.parse_args()

    # Make sure the provided ranges follow the correct syntax (number..number)
    if re.search("\d*\.\.\d*", args.deal_range) is None:
        print("Invalid deal range \"{}\"".format(args.deal_range))
        return None
    if re.search("\d*\.\.\d*", args.tag_range) is None:
        print("Invalid deal range \"{}\"".format(args.tag_range))
        return None
    #/if

    if args.malls < 1:
        print("Must generate files with at least one mall")
        return None
    if args.stores < 1:
        print("Must generate files with at least one store")
        return None
    if args.users < 1:
        print("Must generate files with at least one user")
        return None
    if args.malls > args.stores:
        print("Must have more stores than malls")
        return None
    #/if

    args.deal_range = Range(*[int(i) for i in args.deal_range.split("..")])
    args.tag_range = Range(*[int(i) for i in args.tag_range.split("..")])
    if args.base_dir != "":
        FILE_AUTH  = os.path.join(args.base_dir, FILE_AUTH)
        FILE_DEALS = os.path.join(args.base_dir, FILE_DEALS)
        FILE_MALLS = os.path.join(args.base_dir, FILE_MALLS)
        FILE_TAGS  = os.path.join(args.base_dir, FILE_TAGS)
        FILE_USERS = os.path.join(args.base_dir, FILE_USERS)
    else:
        FILE_AUTH  = os.path.join(".", "src", "data", FILE_AUTH)
        FILE_DEALS = os.path.join(".", "src", "data", FILE_DEALS)
        FILE_MALLS = os.path.join(".", "src", "data", FILE_MALLS)
        FILE_TAGS  = os.path.join(".", "src", "data", FILE_TAGS)
        FILE_USERS = os.path.join(".", "src", "data", FILE_USERS)
    #/if

    return args
#/def


"""
Get a list of k random elements from the entry list.

Parameters:
    entry_list  A list from which to get a random subset
    k           Number of elements in the random subset

Return:
    Returns a subset of size k containing random elements from the
    given list
"""
def random_subset(entry_list, k):
    result = []
    for i in xrange(len(entry_list)):
        if (random.random() * (len(entry_list) - i) < k):
            k -= 1
            result.append(entry_list[i])
    #/for
    return result
#/def


###############################################################################
# Main Function
###############################################################################
def main():
    args = argument_setup()
    if args is None:
        return
    #/if

    generate_db(args)
#/def


if __name__ == "__main__":
    main()
#/if