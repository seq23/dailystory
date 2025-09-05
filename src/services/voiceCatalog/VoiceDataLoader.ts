/**
 * Voice Data Loader
 * Loads the actual voice data from the user's provided files
 */

import type { VoiceDefinition, VoiceOverride } from './types';

export class VoiceDataLoader {
  /**
   * Load beginner voices (complete data from user's level 0 file)
   */
  static loadBeginnerVoices(): VoiceDefinition[] {
    return [
      {
        "id": "meadow_tales_beg_v1",
        "pn": "Keeper of Meadow Tales",
        "vf": { "tone": [1,0], "cad": 9, "var": 3, "wp": [3], "fig": 0.3, "hum": 0.4, "warm": 0.95, "nar": 1 },
        "st": { "hk": [0], "tr": [0], "pz": [4], "ct": [0], "tw": [0], "en": [0,1] },
        "ch": { "hp": [0,2], "pov": "third", "dlg": [0,1], "arc": [0,1] },
        "wd": { "set": [1,2], "sc": "tiny", "mor": "implied", "lp": [0], "rp": [0,1] },
        "rd": { "rh": "none", "aa": 1, "rf": "just_a_little_more", "ono": [8,1,0], "sl": 1 },
        "eg": { "dir": 1, "lst": 0, "ip": ["point_meadow"], "contr": 0, "exag": 0 },
        "th": ["gentle animals","homey comfort","tiny hero"],
        "tg": [1,2,4,0],
        "uig": {
          "aff": { "u": 1.0, "c": 0.7, "a": 0.8, "f": 0.3, "h": 0.2 },
          "rules": {
            "u": { "m": "direct", "max": 6, "gap": 1 },
            "c": { "m": "direct", "max": 3, "gap": 2 },
            "a": { "m": "direct", "max": 2 },
            "f": { "m": "direct", "max": 1 },
            "h": { "m": "direct", "max": 1 }
          }
        },
        "src": ["Beatrix Potter"]
      },
      {
        "id": "goodnight_whisper_beg_v1",
        "pn": "The Goodnight Whisperer",
        "vf": { "tone": [2,3], "cad": 8, "var": 2, "wp": [3,2], "fig": 0.25, "hum": 0.2, "warm": 0.98, "nar": 1 },
        "st": { "hk": [1], "tr": [1], "pz": [0], "ct": [0], "tw": [], "en": [0] },
        "ch": { "hp": [5,1], "pov": "third", "dlg": [6], "arc": [2] },
        "wd": { "set": [0,5], "sc": "tiny", "mor": "implied", "lp": [6], "rp": [4,10] },
        "rd": { "rh": "none", "aa": 1, "rf": "goodnight_little_world", "ono": [3], "sl": 1 },
        "eg": { "dir": 1, "lst": 1, "ip": ["whisper_goodnight"], "contr": 0, "exag": 0 },
        "th": ["bedtime ritual","soothing rhythm"],
        "tg": [0,1],
        "uig": { "aff": { "u": 1.0, "c": 0.6, "a": 0.4, "f": 0.2, "h": 0.1 }, "rules": { "u": { "m": "direct", "max": 6, "gap": 1 }, "c": { "m": "direct", "max": 2, "gap": 3 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 0 }, "h": { "m": "direct", "max": 0 } } },
        "src": ["Margaret Wise Brown"]
      },
      {
        "id": "bear_and_bee_beg_v1",
        "pn": "The Gentle Humorist",
        "vf": { "tone": [4,5], "cad": 10, "var": 3, "wp": [3], "fig": 0.3, "hum": 0.5, "warm": 0.9, "nar": 2 },
        "st": { "hk": [2], "tr": [6,5], "pz": [3], "ct": [2], "tw": [2], "en": [6] },
        "ch": { "hp": [4,2], "pov": "third", "dlg": [0,5], "arc": [1,5] },
        "wd": { "set": [7,6], "sc": "everyday", "mor": "implied", "lp": [], "rp": [6] },
        "rd": { "rh": "none", "aa": 1, "ono": [16,17], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["what_would_you_say"], "contr": 1, "exag": 0 },
        "th": ["friendship","small problems","kind humor"],
        "tg": [6,2],
        "uig": { "aff": { "u": 0.9, "c": 0.5, "a": 0.7, "f": 0.2, "h": 0.2 }, "rules": { "u": { "m": "direct", "max": 4, "gap": 1 }, "c": { "m": "direct", "max": 2, "gap": 3 }, "a": { "m": "direct", "max": 2 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["A. A. Milne"]
      },
      {
        "id": "bright_shapes_beg_v1",
        "pn": "Painter of Bright Shapes",
        "vf": { "tone": [0,8], "cad": 8, "var": 2, "wp": [3], "fig": 0.2, "hum": 0.3, "warm": 0.9, "nar": 1 },
        "st": { "hk": [3], "tr": [2,3], "pz": [2], "ct": [2], "tw": [7], "en": [1] },
        "ch": { "hp": [], "pov": "third", "dlg": [6], "arc": [8] },
        "wd": { "set": [9,2], "sc": "tiny", "mor": "implied", "lp": [4], "rp": [4,5] },
        "rd": { "rh": "none", "aa": 1, "ono": [2,8], "sl": 1 },
        "eg": { "dir": 1, "lst": 1, "ip": ["what_comes_next"], "contr": 0, "exag": 1 },
        "th": ["colors","counting","nature wonder"],
        "tg": [8,9,18],
        "uig": { "aff": { "u": 0.8, "c": 1.0, "a": 0.4, "f": 0.1, "h": 0.1 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 3, "gap": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 0 }, "h": { "m": "direct", "max": 0 } } },
        "src": ["Eric Carle"]
      },
      {
        "id": "city_snow_beg_v1",
        "pn": "Poet of City Snow",
        "vf": { "tone": [8,4], "cad": 10, "var": 3, "wp": [2], "fig": 0.5, "hum": 0.2, "warm": 0.9, "nar": 0 },
        "st": { "hk": [4], "tr": [8,9], "pz": [3], "ct": [0], "tw": [8], "en": [3] },
        "ch": { "hp": [2,8], "pov": "third", "dlg": [0,1], "arc": [8] },
        "wd": { "set": [3,11], "sc": "everyday", "mor": "implied", "lp": [], "rp": [7] },
        "rd": { "rh": "none", "aa": 1, "ono": [4,8], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["look_around_you"], "contr": 0, "exag": 0 },
        "th": ["city childhood","seasons","small wonders"],
        "tg": [10,11],
        "uig": { "aff": { "u": 0.9, "c": 0.5, "a": 0.3, "f": 0.4, "h": 0.3 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2, "gap": 3 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Ezra Jack Keats"]
      },
      {
        "id": "paper_mice_beg_v1",
        "pn": "Maker of Paper Stories",
        "vf": { "tone": [14,1], "cad": 10, "var": 3, "wp": [0], "fig": 0.5, "hum": 0.2, "warm": 0.85, "nar": 2 },
        "st": { "hk": [2], "tr": [3,7], "pz": [3], "ct": [3], "tw": [7], "en": [6] },
        "ch": { "hp": [9], "pov": "third", "dlg": [6], "arc": [6] },
        "wd": { "set": [13,14], "sc": "tiny", "mor": "symbolic", "lp": [4], "rp": [1] },
        "rd": { "rh": "none", "aa": 0, "ono": [12,13], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["make_your_own_shape"], "contr": 0, "exag": 0 },
        "th": ["identity","friendship","art play"],
        "tg": [18,19,6],
        "uig": { "aff": { "u": 0.8, "c": 0.9, "a": 0.3, "f": 0.1, "h": 0.4 }, "rules": { "u": { "m": "direct", "max": 3 }, "c": { "m": "direct", "max": 3, "gap": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 0 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Leo Lionni"]
      },
      {
        "id": "folktale_frost_beg_v1",
        "pn": "Painter of Folk Frost",
        "vf": { "tone": [9,11], "cad": 11, "var": 3, "wp": [0], "fig": 0.5, "hum": 0.3, "warm": 0.85, "nar": 1 },
        "st": { "hk": [4], "tr": [7,2], "pz": [0], "ct": [0], "tw": [6], "en": [7] },
        "ch": { "hp": [0,9], "pov": "third", "dlg": [1], "arc": [7,1] },
        "wd": { "set": [6,7], "sc": "everyday", "mor": "implied", "lp": [5], "rp": [8] },
        "rd": { "rh": "none", "aa": 1, "ono": [4], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["trace_the_pattern"], "contr": 0, "exag": 0 },
        "th": ["folklore","seasons","kindness"],
        "tg": [21,11,20],
        "uig": { "aff": { "u": 0.9, "c": 0.6, "a": 0.7, "f": 0.4, "h": 0.2 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 2 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Jan Brett"]
      },
      {
        "id": "oops_and_fix_beg_v1",
        "pn": "Chief of Oops & Fix",
        "vf": { "tone": [11,6], "cad": 9, "var": 3, "wp": [3,4], "fig": 0.2, "hum": 0.9, "warm": 0.8, "nar": 0 },
        "st": { "hk": [6], "tr": [3,5], "pz": [2], "ct": [1], "tw": [5], "en": [2] },
        "ch": { "hp": [4,8], "pov": "first", "dlg": [3], "arc": [4] },
        "wd": { "set": [5,4], "sc": "everyday", "mor": "humor_hidden", "lp": [3], "rp": [2] },
        "rd": { "rh": "none", "aa": 1, "ono": [1,2], "sl": 0 },
        "eg": { "dir": 1, "lst": 1, "ip": ["say_it_fast"], "contr": 1, "exag": 1 },
        "th": ["try again","mistakes welcome","friendship"],
        "tg": [7,6],
        "uig": { "aff": { "u": 1.0, "c": 0.7, "a": 0.5, "f": 0.6, "h": 0.5 }, "rules": { "u": { "m": "direct", "max": 6, "gap": 1 }, "c": { "m": "direct", "max": 3 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Mo Willems"]
      },
      {
        "id": "curious_trouble_beg_v1",
        "pn": "Curious Trouble-Maker",
        "vf": { "tone": [6,7], "cad": 11, "var": 3, "wp": [3], "fig": 0.25, "hum": 0.8, "warm": 0.8, "nar": 2 },
        "st": { "hk": [2], "tr": [3,5], "pz": [2], "ct": [1], "tw": [4], "en": [3] },
        "ch": { "hp": [4,3], "pov": "third", "dlg": [0,2], "arc": [8] },
        "wd": { "set": [3,10,5], "sc": "everyday", "mor": "implied", "lp": [3], "rp": [2] },
        "rd": { "rh": "none", "aa": 1, "ono": [16,0], "sl": 0 },
        "eg": { "dir": 0, "lst": 1, "ip": ["what_happens_next"], "contr": 1, "exag": 1 },
        "th": ["curiosity","consequences","fixing it"],
        "tg": [6,15],
        "uig": { "aff": { "u": 0.9, "c": 0.5, "a": 0.9, "f": 0.4, "h": 0.4 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 2 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["H. A. Rey"]
      },
      {
        "id": "lost_teddy_beg_v1",
        "pn": "Finder of Lost Teddies",
        "vf": { "tone": [12,13], "cad": 10, "var": 3, "wp": [0], "fig": 0.4, "hum": 0.2, "warm": 0.95, "nar": 0 },
        "st": { "hk": [8], "tr": [9,8], "pz": [3], "ct": [3], "tw": [4], "en": [3] },
        "ch": { "hp": [8], "pov": "third", "dlg": [0,1], "arc": [6] },
        "wd": { "set": [3,11], "sc": "everyday", "mor": "implied", "lp": [4], "rp": [6] },
        "rd": { "rh": "none", "aa": 0, "ono": [16,13], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["where_would_you_look"], "contr": 0, "exag": 0 },
        "th": ["attachment","kindness","finding"],
        "tg": [12,20,10],
        "uig": { "aff": { "u": 1.0, "c": 0.5, "a": 0.5, "f": 0.2, "h": 0.2 }, "rules": { "u": { "m": "direct", "max": 5, "gap": 1 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 0 }, "h": { "m": "direct", "max": 0 } } },
        "src": ["Don Freeman"]
      },
      {
        "id": "if_you_give_beg_v1",
        "pn": "Master of Loops & Cookies",
        "vf": { "tone": [11,6], "cad": 10, "var": 3, "wp": [3], "fig": 0.2, "hum": 0.7, "warm": 0.8, "nar": 1 },
        "st": { "hk": [10], "tr": [3,6], "pz": [2], "ct": [1], "tw": [3], "en": [1] },
        "ch": { "hp": [4], "pov": "third", "dlg": [2], "arc": [3] },
        "wd": { "set": [5,3], "sc": "everyday", "mor": "humor_hidden", "lp": [3], "rp": [3] },
        "rd": { "rh": "none", "aa": 1, "ono": [2,9], "sl": 0 },
        "eg": { "dir": 1, "lst": 1, "ip": ["what_comes_next"], "contr": 1, "exag": 1 },
        "th": ["chains of fun","snack adventures"],
        "tg": [7,15],
        "uig": { "aff": { "u": 0.9, "c": 0.6, "a": 0.7, "f": 1.0, "h": 0.4 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 2 }, "f": { "m": "direct", "max": 2 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Laura Numeroff"]
      },
      {
        "id": "bear_family_beg_v1",
        "pn": "Chronicler of Bear Street",
        "vf": { "tone": [10,4], "cad": 11, "var": 3, "wp": [0], "fig": 0.25, "hum": 0.4, "warm": 0.9, "nar": 2 },
        "st": { "hk": [11], "tr": [6,4], "pz": [3], "ct": [2], "tw": [2], "en": [5] },
        "ch": { "hp": [8,4], "pov": "third", "dlg": [4,1], "arc": [3] },
        "wd": { "set": [5,4], "sc": "everyday", "mor": "overt", "lp": [], "rp": [9] },
        "rd": { "rh": "none", "aa": 0, "ono": [16,17], "sl": 0 },
        "eg": { "dir": 0, "lst": 1, "ip": ["family_prompt"], "contr": 0, "exag": 0 },
        "th": ["family values","school day","helping out"],
        "tg": [14,15],
        "uig": { "aff": { "u": 0.9, "c": 0.5, "a": 0.4, "f": 0.5, "h": 0.3 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Stan & Jan Berenstain"]
      },
      {
        "id": "button_mouse_beg_v1",
        "pn": "The Button Collector",
        "vf": { "tone": [1,8], "cad": 10, "var": 3, "wp": [3], "fig": 0.35, "hum": 0.4, "warm": 0.9, "nar": 0 },
        "st": { "hk": [2], "tr": [4,6], "pz": [3], "ct": [3], "tw": [8], "en": [6] },
        "ch": { "hp": [6,8,4], "pov": "third", "dlg": [4,1], "arc": [1] },
        "wd": { "set": [5,4], "sc": "everyday", "mor": "implied", "lp": [], "rp": [0] },
        "rd": { "rh": "none", "aa": 1, "ono": [14,13], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["what_would_help"], "contr": 0, "exag": 0 },
        "th": ["feelings","school day","small courage"],
        "tg": [22,15],
        "uig": { "aff": { "u": 0.9, "c": 0.6, "a": 0.4, "f": 0.3, "h": 0.3 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Kevin Henkes"]
      },
      {
        "id": "barnyard_bop_beg_v1",
        "pn": "The Barnyard Bopper",
        "vf": { "tone": [11,0], "cad": 8, "var": 2, "wp": [1,2,3,4], "fig": 0.2, "hum": 0.9, "warm": 0.8, "nar": 1 },
        "st": { "hk": [6], "tr": [3], "pz": [2], "ct": [1], "tw": [5], "en": [2] },
        "ch": { "hp": [0], "pov": "third", "dlg": [7], "arc": [0] },
        "wd": { "set": [12], "sc": "everyday", "mor": "humor_hidden", "lp": [], "rp": [10] },
        "rd": { "rh": "end", "aa": 1, "rf": "bop_bop_moo", "ono": [15,18,14], "sl": 0 },
        "eg": { "dir": 1, "lst": 1, "ip": ["say_it_loud"], "contr": 1, "exag": 1 },
        "th": ["music play","farm fun","join the group"],
        "tg": [13,21,23],
        "uig": { "aff": { "u": 1.0, "c": 0.6, "a": 1.0, "f": 0.5, "h": 0.6 }, "rules": { "u": { "m": "direct", "max": 6 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 2 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Sandra Boynton"]
      },
      {
        "id": "city_cartoon_beg_v1",
        "pn": "City Cartoonist",
        "vf": { "tone": [4,5], "cad": 10, "var": 3, "wp": [0], "fig": 0.25, "hum": 0.6, "warm": 0.8, "nar": 2 },
        "st": { "hk": [2], "tr": [6], "pz": [2], "ct": [1], "tw": [5], "en": [2] },
        "ch": { "hp": [4], "pov": "third", "dlg": [3,4], "arc": [4] },
        "wd": { "set": [3,5], "sc": "everyday", "mor": "implied", "lp": [3], "rp": [2] },
        "rd": { "rh": "none", "aa": 1, "ono": [16,6], "sl": 0 },
        "eg": { "dir": 0, "lst": 1, "ip": ["spot_the_gag"], "contr": 1, "exag": 1 },
        "th": ["simple city humor","school sillies"],
        "tg": [10,15],
        "uig": { "aff": { "u": 0.9, "c": 0.5, "a": 0.4, "f": 0.3, "h": 0.4 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Syd Hoff"]
      },
      {
        "id": "two_friends_beg_v1",
        "pn": "Two Friends in the Pond",
        "vf": { "tone": [1,4], "cad": 10, "var": 2, "wp": [0,3], "fig": 0.3, "hum": 0.5, "warm": 0.9, "nar": 1 },
        "st": { "hk": [2], "tr": [0,6], "pz": [3], "ct": [3], "tw": [2], "en": [6] },
        "ch": { "hp": [4], "pov": "third", "dlg": [0,1], "arc": [5] },
        "wd": { "set": [6,7], "sc": "everyday", "mor": "implied", "lp": [], "rp": [0] },
        "rd": { "rh": "none", "aa": 1, "ono": [14,13], "sl": 1 },
        "eg": { "dir": 0, "lst": 0, "ip": ["read_with_friends"], "contr": 0, "exag": 0 },
        "th": ["gentle vignettes","friendship"],
        "tg": [6],
        "uig": { "aff": { "u": 0.9, "c": 0.5, "a": 0.5, "f": 0.2, "h": 0.2 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 0 }, "h": { "m": "direct", "max": 0 } } },
        "src": ["Arnold Lobel"]
      },
      {
        "id": "peek_and_find_beg_v1",
        "pn": "The Peek-And-Find Guide",
        "vf": { "tone": [0,4], "cad": 8, "var": 2, "wp": [3], "fig": 0.2, "hum": 0.4, "warm": 0.9, "nar": 1 },
        "st": { "hk": [7], "tr": [3], "pz": [2], "ct": [2], "tw": [8], "en": [6] },
        "ch": { "hp": [], "pov": "third", "dlg": [6], "arc": [8] },
        "wd": { "set": [5], "sc": "tiny", "mor": "implied", "lp": [], "rp": [10] },
        "rd": { "rh": "none", "aa": 1, "ono": [2,0], "sl": 1 },
        "eg": { "dir": 1, "lst": 1, "ip": ["find_it"], "contr": 0, "exag": 0 },
        "th": ["seek and find","discovery"],
        "tg": [23,4],
        "uig": { "aff": { "u": 0.8, "c": 0.7, "a": 0.4, "f": 0.2, "h": 0.2 }, "rules": { "u": { "m": "direct", "max": 3 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 1 }, "f": { "m": "direct", "max": 0 }, "h": { "m": "direct", "max": 0 } } },
        "src": ["Eric Hill"]
      },
      {
        "id": "list_poet_beg_v1",
        "pn": "List-Poet of Classrooms",
        "vf": { "tone": [11,4], "cad": 10, "var": 3, "wp": [2,3], "fig": 0.2, "hum": 0.5, "warm": 0.9, "nar": 1 },
        "st": { "hk": [2], "tr": [1,3], "pz": [2], "ct": [1], "tw": [5], "en": [2] },
        "ch": { "hp": [4], "pov": "third", "dlg": [7], "arc": [0] },
        "wd": { "set": [4,5], "sc": "everyday", "mor": "humor_hidden", "lp": [], "rp": [10] },
        "rd": { "rh": "none", "aa": 1, "ono": [2], "sl": 0 },
        "eg": { "dir": 1, "lst": 1, "ip": ["read_aloud_chant"], "contr": 1, "exag": 1 },
        "th": ["rhythmic lists","school animals"],
        "tg": [15,13,23],
        "uig": { "aff": { "u": 0.9, "c": 0.6, "a": 0.8, "f": 0.4, "h": 0.3 }, "rules": { "u": { "m": "direct", "max": 4 }, "c": { "m": "direct", "max": 2 }, "a": { "m": "direct", "max": 2 }, "f": { "m": "direct", "max": 1 }, "h": { "m": "direct", "max": 1 } } },
        "src": ["Bill Martin Jr."]
      }
    ];
  }

  /**
   * Load easy overrides (delta format from user's level 1 file)
   */
  static loadEasyOverrides(): VoiceOverride[] {
    return [
      { "ref":"meadow_tales_beg_v1", "id":"meadow_tales_easy_v1",
        "vf":{"cad":10}, "uig":{"rules":{"u":{"max":4},"c":{"max":3},"a":{"max":2},"f":{"max":1},"h":{"max":1}}} },
      { "ref":"goodnight_whisper_beg_v1", "id":"goodnight_whisper_easy_v1",
        "vf":{"cad":9}, "uig":{"rules":{"u":{"max":4},"c":{"max":2}}} },
      { "ref":"bear_and_bee_beg_v1", "id":"bear_and_bee_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3},"a":{"max":2}}} },
      { "ref":"bright_shapes_beg_v1", "id":"bright_shapes_easy_v1",
        "vf":{"cad":9}, "uig":{"rules":{"u":{"max":3},"c":{"max":3}}} },
      { "ref":"city_snow_beg_v1", "id":"city_snow_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3},"c":{"max":2},"f":{"max":1}}} },
      { "ref":"paper_mice_beg_v1", "id":"paper_mice_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3},"c":{"max":3},"h":{"max":1}}} },
      { "ref":"folktale_frost_beg_v1", "id":"folktale_frost_easy_v1",
        "vf":{"cad":12}, "uig":{"rules":{"u":{"max":3},"a":{"max":2},"f":{"max":1}}} },
      { "ref":"oops_and_fix_beg_v1", "id":"oops_and_fix_easy_v1",
        "vf":{"cad":10}, "uig":{"rules":{"u":{"max":4},"f":{"max":1},"h":{"max":1}}} },
      { "ref":"curious_trouble_beg_v1", "id":"curious_trouble_easy_v1",
        "vf":{"cad":12}, "uig":{"rules":{"u":{"max":3},"a":{"max":2}}} },
      { "ref":"lost_teddy_beg_v1", "id":"lost_teddy_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3},"c":{"max":2}}} },
      { "ref":"if_you_give_beg_v1", "id":"if_you_give_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3},"a":{"max":2},"f":{"max":2}}} },
      { "ref":"bear_family_beg_v1", "id":"bear_family_easy_v1",
        "vf":{"cad":12}, "uig":{"rules":{"u":{"max":3},"f":{"max":1}}} },
      { "ref":"button_mouse_beg_v1", "id":"button_mouse_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3}}} },
      { "ref":"barnyard_bop_beg_v1", "id":"barnyard_bop_easy_v1",
        "vf":{"cad":9}, "uig":{"rules":{"u":{"max":4},"a":{"max":2}}} },
      { "ref":"city_cartoon_beg_v1", "id":"city_cartoon_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3}}} },
      { "ref":"two_friends_beg_v1", "id":"two_friends_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3}}} },
      { "ref":"peek_and_find_beg_v1", "id":"peek_and_find_easy_v1",
        "vf":{"cad":9}, "uig":{"rules":{"u":{"max":3},"c":{"max":2}}} },
      { "ref":"list_poet_beg_v1", "id":"list_poet_easy_v1",
        "vf":{"cad":11}, "uig":{"rules":{"u":{"max":3}}} }
    ];
  }

  /**
   * Load medium voices (your level 2 data)
   */
  static loadMediumVoices(): VoiceDefinition[] {
    return [
      {
        "id":"neighborhood_realist_med_v1","pn":"Neighborhood Realist",
        "vf":{"tone":[4,5],"cad":12,"var":4,"wp":[0,3],"fig":0.35,"hum":0.5,"warm":0.9,"nar":2},
        "st":{"hk":[2],"tr":[6,2],"pz":[3],"ct":[5],"tw":[8],"en":[6]},
        "ch":{"hp":[8,4],"pov":"third","dlg":[4,1],"arc":[3,11]},
        "wd":{"set":[18,4,5],"sc":"everyday","mor":"implied","lp":[],"rp":[9]},
        "rd":{"rh":"none","aa":1,"ono":[16],"sl":1},
        "eg":{"dir":0,"lst":1,"ip":["what_would_you_do"],"contr":0,"exag":0},
        "th":["friendship","school day","small wins"],"tg":[6,15],
        "uig":{"aff":{"u":0.8,"c":0.4,"a":0.3,"f":0.3,"h":0.5},"rules":{"u":{"m":"subtle","max":2},"c":{"m":"subtle","max":2},"a":{"m":"subtle","max":1},"f":{"m":"subtle","max":1},"h":{"m":"subtle","max":1}}},
        "src":["Beverly Cleary"]
      }
    ];
  }

  /**
   * Load hard voices (your level 3 data)
   */
  static loadHardVoices(): VoiceDefinition[] {
    return [
      {
        "id":"doorway_chronicler_hard_v1","pn":"Doorway Chronicler",
        "vf":{"tone":[9,4],"cad":13,"var":3,"wp":[0],"fig":0.6,"hum":0.3,"warm":0.75,"nar":2},
        "st":{"hk":[12],"tr":[4,10],"pz":[0,5],"ct":[4],"tw":[1,10,11],"en":[8,9]},
        "ch":{"hp":[12,0],"pov":"third","dlg":[5,9],"arc":[11,10]},
        "wd":{"set":[6,21,8],"sc":"grand","mor":"symbolic","lp":["portal"],"rp":["three_trials"]},
        "rd":{"rh":"none","aa":1,"ono":["thrum"],"sl":1},
        "eg":{"dir":0,"lst":0,"ip":[],"contr":0,"exag":0},
        "th":["portal_fantasy","choice","friendship"],"tg":[16,26,27],
        "uig":{"aff":{"u":0.6,"c":0.3,"a":0.3,"f":0.2,"h":0.3},"rules":{"u":{"m":"subtle","max":1},"c":{"m":"subtle","max":2},"a":{"m":"subtle","max":1},"f":{"m":"subtle","max":1},"h":{"m":"subtle","max":1}}},
        "src":["C. S. Lewis"]
      }
    ];
  }

  /**
   * Load expert voices (your level 4 data)
   */
  static loadExpertVoices(): VoiceDefinition[] {
    return [
      {
        "id":"academy_hidden_doors_exp_v1","pn":"Academy of Hidden Doors",
        "vf":{"tone":[18,9],"cad":14,"var":4,"wp":[0,3],"fig":0.55,"hum":0.5,"warm":0.8,"nar":2},
        "st":{"hk":[14],"tr":[10],"pz":[5],"ct":[4],"tw":[1,12,10,11],"en":[9]},
        "ch":{"hp":[11,12,10],"pov":"third","dlg":[8,4],"arc":[9,11]},
        "wd":{"set":[14,21,23],"sc":"grand","mor":"implied","lp":["legend_bleeds_present"],"rp":["three_trials","series_button"]},
        "rd":{"rh":"none","aa":0,"ono":["whoosh","clang"],"sl":1},
        "eg":{"dir":0,"lst":0,"ip":["solve_with_team"],"contr":0,"exag":0},
        "th":["magic_school","found_family","responsibility"],"tg":[31,28,29],
        "uig":{"aff":{"u":0.5,"c":0.3,"a":0.3,"f":0.2,"h":0.4},"rules":{"u":{"m":"subtle","max":1},"c":{"m":"subtle","max":1},"a":{"m":"subtle","max":1},"f":{"m":"subtle","max":1},"h":{"m":"subtle","max":1}}},
        "src":["J. K. Rowling"]
      }
    ];
  }
}
