import { useState, useEffect, useMemo } from 'react';
import useAlerts from '../hooks/useAlerts';
import useAuth, { useAuthActions } from './../hooks/useAuth';

// components
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import Navbar from '../components/shared/Navbar/Navbar';
import {
  InnerColumn,
  PageContent,
} from './../components/shared/PageComponents';

// services & utils
import { makeStyles } from '@mui/styles';
import { getAllUsers } from './../services/users';
import { updateUser } from './../services/auth';
import { setAuthToken } from './../services/auth';

// remove spaces from # in discord name
const removeSpaces = (str) => {
  return str
    .trim()
    .replace(/\s([#])/g, function (el1, el2) {
      return '' + el2;
    })
    .replace(/(«)\s/g, function (el1, el2) {
      return el2 + '';
    });
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
}));

// userEdit
export default function Settings() {
  const { currentUser } = useAuth();
  const { setCurrentUser } = useAuthActions();

  const [allUsers, setAllUsers] = useState([]);
  const [userData, setUserData] = useState({
    name: currentUser?.name, // LoL summoner name
    discord: currentUser?.discord,
    adminKey: currentUser?.adminKey ?? '',
    region: currentUser?.region ?? 'NA',
    ...currentUser,
  });

  const { setCurrentAlert } = useAlerts();

  const [rankData, setRankData] = useState({
    rankDivision: currentUser?.rank?.replace(/[0-9]/g, '').trim(), // match letters, trim spaces.
    rankNumber: currentUser?.rank?.replace(/[a-z]/gi, '').trim(), // match numbers
  });

  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
  ];

  const classes = useStyles();

  const usersInRegion = useMemo(
    () => allUsers.filter((user) => user?.region === userData?.region),
    [allUsers, userData?.region]
  );

  const foundUserSummonerName = useMemo(
    () =>
      // check only for users in the region.
      usersInRegion.find(
        // make sure it's not the same user with uid.
        ({ name, _id }) => {
          if (_id === currentUser?._id) {
            return false;
          }

          return name === userData.name;
        }
      ),
    [userData.name, usersInRegion, currentUser?._id]
  );

  const foundUserDiscord = useMemo(
    () =>
      // discord is unique across all regions, unlike summoner names.
      allUsers.find(({ discord, _id }) => {
        // make sure it's not the same user with _id.
        if (_id === currentUser?._id) {
          return false;
        }

        return removeSpaces(discord) === removeSpaces(userData.discord);
      }),
    [userData.discord, allUsers, currentUser?._id]
  );

  // chrone is throwing a violation error for this: [Violation] 'submit' handler took 701ms
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (foundUserSummonerName) {
      setCurrentAlert({
        type: 'Error',
        message: `Summoner name ${userData.name} in ${userData.region} is already taken!`,
      });
      return;
    }

    if (foundUserDiscord) {
      setCurrentAlert({
        type: 'Error',
        message: `Discord name ${userData.discord} is already taken!`,
      });
      return;
    }

    let yes = window.confirm(`are you sure you want to update your account? \n
    Summoner Name: ${userData.name} \n
    Region: ${userData.region} \n
    Rank: ${userData.rank} \n
     ${userData.adminKey ? 'Admin key: ' + userData.adminKey : ''}
    `);

    if (!yes) return;
    try {
      const data = await updateUser(currentUser?._id, {
        ...userData,
        name: userData.name.trim(),
      });

      if (data?.token) {
        const { token } = data;
        localStorage.setItem('jwtToken', token); // add token to back-end
        setAuthToken(token); // add authorization in the request to be bearer token.
        let updatedUser = data?.user;
        setCurrentUser(updatedUser);
        setUserData({ ...updatedUser });
        setCurrentAlert({
          type: 'Success',
          message: 'Account details updated!',
        });
      }
    } catch (error) {
      console.error('ERROR:', error);
      let errMsg = error.messasge;
      setCurrentAlert({
        type: 'Error',
        message: errMsg ?? error,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      // for checking if summoner name or discord are taken.
      const allUsersData = await getAllUsers();

      setAllUsers(allUsersData);
    };
    fetchUsers();
    return () => {
      fetchUsers();
    };
  }, []);

  useEffect(() => {
    const { rankNumber, rankDivision } = rankData;
    let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

    let rankResult = isDivisionWithNumber
      ? `${rankDivision} ${rankNumber === '' ? '4' : rankNumber}` // when user saved a rank without a number but then changes back to rank with number
      : rankDivision;

    setUserData((prevState) => ({
      //  change rank everytime one of the values in rankData changes.
      // doing this because number and division are separate selects, but back-end is accepting 1 string which is both.
      ...prevState,
      rank: rankResult,
    }));

    return () => {
      setUserData((prevState) => ({
        ...prevState,
        rank: rankResult,
      }));
    };
    // eslint-disable-next-line
  }, [rankData]);

  return (
    <>
      <Navbar showLess />
      <PageContent>
        <InnerColumn>
          <form onSubmit={handleSubmit}>
            <Grid
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              spacing={4}
              style={{
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'auto',
              }}>
              <Grid item>
                <Typography variant="h1">Settings</Typography>
              </Grid>

              <Grid
                item
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={4}>
                {/* SUMMONER NAME */}
                <Grid item>
                  <TextField
                    type="text"
                    name="name"
                    style={{ width: 230 }}
                    variant="filled"
                    value={userData.name || ''}
                    onChange={handleChange}
                    label="Summoner Name"
                    required
                  />
                </Grid>

                {/* DISCORD */}
                <Grid item>
                  <TextField
                    type="text"
                    variant="filled"
                    name="discord"
                    style={{ width: 230 }}
                    value={userData.discord || ''}
                    onChange={handleChange}
                    label="Discord (name and #)"
                    required
                  />
                </Grid>
              </Grid>

              {/* CONTAINER BOTH REGION & ADMIN KEY */}
              <Grid
                item
                container
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={4}>
                <Grid item>
                  {/* REGION */}
                  <FormControl className={classes.formControl} variant="filled">
                    <InputLabel>Region</InputLabel>
                    <Select
                      fullWidth
                      style={{ width: 230 }}
                      name="region"
                      value={userData.region}
                      onChange={handleChange}
                      required>
                      <MenuItem selected disabled>
                        select region
                      </MenuItem>
                      {['NA', 'EUW', 'EUNE', 'LAN'].map((region, key) => (
                        <MenuItem value={region} key={key}>
                          {region}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* ADMIN KEY */}
                <Grid item>
                  <TextField
                    variant="filled"
                    type="text"
                    name="adminKey"
                    style={{ width: 230 }}
                    value={userData.adminKey || ''}
                    onChange={handleChange}
                    label="Admin key (not required)"
                  />
                </Grid>
              </Grid>

              {/* RANK DIVISION AND # */}
              <Grid
                item
                container
                alignItems="center"
                spacing={4}
                justifyContent="center">
                <Grid item>
                  <FormHelperText>Rank Division</FormHelperText>
                  <Select
                    variant="standard"
                    name="rankDivision"
                    required
                    value={rankData.rankDivision}
                    onChange={(e) =>
                      setRankData((prevState) => ({
                        ...prevState,
                        [e.target.name]: e.target.value,
                      }))
                    }>
                    {[
                      'Unranked',
                      'Iron',
                      'Bronze',
                      'Silver',
                      'Gold',
                      'Platinum',
                      'Diamond',
                      'Master',
                      'Grandmaster',
                      'Challenger',
                    ].map((value, key) => (
                      <MenuItem value={value} key={key}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                {/* exclude this number select from divisions without numbers */}
                {divisionsWithNumbers.includes(rankData.rankDivision) && (
                  <Grid item>
                    <FormHelperText>Rank Number</FormHelperText>
                    <Select
                      variant="standard"
                      name="rankNumber"
                      required={divisionsWithNumbers.includes(
                        rankData.rankDivision
                      )}
                      value={rankData.rankNumber || '4'}
                      onChange={(e) =>
                        setRankData((prevState) => ({
                          ...prevState,
                          [e.target.name]: e.target.value,
                        }))
                      }>
                      <MenuItem selected disabled>
                        select rank number
                      </MenuItem>
                      <MenuItem value={4}>4</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={1}>1</MenuItem>
                    </Select>
                  </Grid>
                )}
              </Grid>

              <div className="page-break" />
              <Grid item>
                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </InnerColumn>
      </PageContent>
    </>
  );
}
