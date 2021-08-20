import './App.css';

import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { MenuItem } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    padding: theme.spacing(1.5, 1),
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  heroContent: {
    padding: theme.spacing(4, 0, 6),
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
  formControl: {
    marginRight: theme.spacing(1),
    minWidth: 120,
  },
  margin: {
    margin: theme.spacing(1),
  }
}));

function parseDNS(rr, data) {
  var out = ""
  try {
    switch (rr) {
      case "A":
        for (const rsp of data) {
          out = out + rsp.A + "\n"
        }
        break;
      case "AAAA":
        for (const rsp of data) {
          out = out + rsp.AAAA + "\n"
        }
        break;
      case "CAA":
        for (const rsp of data) {
          out = out + rsp.Tag + " " + rsp.Value + "\n"
        }
        break;
      case "CNAME":
        for (const rsp of data) {
          out = out + rsp.Target + "\n"
        }
        break;
      case "MX":
        for (const rsp of data) {
          out = out + rsp.Mx + " " + rsp.Preference + "\n"
        }
        break;
      case "NS":
        for (const rsp of data) {
          out = out + rsp.Ns + "\n"
        }
        break;
      case "PTR":
        for (const rsp of data) {
          out = out + rsp.Ptr + "\n"
        }
        break;
      case "SRV":
        for (const rsp of data) {
          out = out + rsp.Priority + " " + rsp.Weight + " " + rsp.Port + " " + rsp.Target + "\n"
        }
        break;
      case "TXT":
        for (const rsp of data) {
          if (rsp.Txt != null) {
            for (const txt of rsp.Txt) {
              out = out + txt + "\n"
            }
          }
        }
        break;
      default:
        console.log(data);
        break;
    }
    return out;
  } catch (error) {
    return "Whoops! Something went wrong!"
  }
}

function App() {
  const classes = useStyles();
  const [rr, setRr] = React.useState('');
  const [name, setName] = React.useState('');

  const [trace, setTrace] = React.useState('');
  const [cf, setCF] = React.useState('');
  const [goog, setGoog] = React.useState('');
  const [quad, setQuad] = React.useState('');

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );


  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleRrChange = (event) => {
    setRr(event.target.value);
  };

  const handleClick = (event) => {
    setTrace("")
    fetch("https://diglett.dns.mw/trace?name=" + name)
      .then(response => response.json())
      .then(data => {
        var out = "";

        try {
          for (const rsp of data) {
            if (rsp.Msg.Authoritative) {
              for (const ans of rsp.Msg.Answer) {
                out = out + ans.Hdr.Name + "\t" + ans.A + "\n"
              }
            }
            if (rsp.Msg.Ns != null) {
              for (const ns of rsp.Msg.Ns) {
                out = out + ns.Hdr.Name + "\t" + ns.Ns + "\n"
              }
            }
            out = out + "Received from " + rsp.Server + " " + rsp.ServerIP + "\n"
          }
        } catch (error) {
          out = "Whoops! Something went wrong!"
        }
        setTrace(out);
      });
    fetch("https://diglett.dns.mw/record?name=" + name + "&ns=1.1.1.1&type=" + (rr ? rr : "A"))
      .then(response => response.json())
      .then(data => {
        const res = parseDNS((rr ? rr : "A"), data);
        setCF(res)
      });
    fetch("https://diglett.dns.mw/record?name=" + name + "&ns=8.8.8.8&type=" + (rr ? rr : "A"))
      .then(response => response.json())
      .then(data => {
        const res = parseDNS((rr ? rr : "A"), data);
        setGoog(res)
      });
    fetch("https://diglett.dns.mw/record?name=" + name + "&ns=9.9.9.9&type=" + (rr ? rr : "A"))
      .then(response => response.json())
      .then(data => {
        const res = parseDNS((rr ? rr : "A"), data);
        setQuad(res)
      });
  };
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <form className={classes.toolbarTitle} autoComplete="off">
              <TextField
                className={classes.formControl}
                value={rr}
                onChange={handleRrChange}
                select
                label="RR Type"
                variant="outlined"
              >
                <MenuItem key={1} value="A">A</MenuItem>
                <MenuItem key={2} value="AAAA">AAAA</MenuItem>
                <MenuItem key={3} value="CAA">CAA</MenuItem>
                <MenuItem key={4} value="CNAME">CNAME</MenuItem>
                <MenuItem key={5} value="MX">MX</MenuItem>
                <MenuItem key={6} value="NS">NS</MenuItem>
                <MenuItem key={7} value="PTR">PTR</MenuItem>
                <MenuItem key={8} value="SRV">SRV</MenuItem>
                <MenuItem key={9} value="TXT">TXT</MenuItem>
              </TextField>
              <TextField
                required
                id="outlined-required"
                label="DNS Name"
                variant="outlined"
                onChange={handleNameChange}
              />
              <Button
                onClick={handleClick}
                variant="contained"
                size="large"
                color="primary"
                className={classes.margin}>
                Resolve
              </Button>
            </form>
            <nav>
              <Link variant="button" color="textPrimary" href="https://github.com/alyx/diglett-fe" className={classes.link}>
                GitHub
              </Link>
            </nav>
          </Toolbar>
        </AppBar>
        {/* Hero unit */}
        <Container maxWidth="sm" component="main" className={classes.heroContent}>

        </Container>
        <Container maxWidth="lg" component="main">
          <Grid container spacing={6} alignItems="flex-end">
            <Grid item key="cloudflare" xs={12} sm={6} md={4} lg={4}>
              <Card>
                <CardHeader
                  title="Cloudflare"
                  subheader="1.1.1.1"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  style={{
                    backgroundColor: (theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700])
                  }}
                  className={classes.cardHeader}
                />
                <CardContent>
                  {cf !== "" ? <pre>{cf}</pre> :
                    <Typography>
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                    </Typography>
                  }
                </CardContent>
              </Card>
            </Grid>
            <Grid item key="google" xs={12} sm={6} md={4} lg={4}>
              <Card>
                <CardHeader
                  title="Google DNS"
                  subheader="8.8.8.8"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  style={{
                    backgroundColor: (theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700])
                  }}
                  className={classes.cardHeader}
                />
                <CardContent>
                  {goog !== "" ? <pre>{goog}</pre> :
                    <Typography>
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                    </Typography>
                  }
                </CardContent>
              </Card>
            </Grid>
            <Grid item key="quad9" xs={12} sm={6} md={4} lg={4}>
              <Card>
                <CardHeader
                  title="Quad9"
                  subheader="9.9.9.9"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  style={{
                    backgroundColor: (theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700])
                  }}
                  className={classes.cardHeader}
                />
                <CardContent>
                  {quad !== "" ? <pre>{quad}</pre> :
                    <Typography>
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                      <Skeleton variant="text" width={"100%"} />
                    </Typography>
                  }
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={6} alignItems="flex-end">
            <Grid item key="trace" xs={12} sm={12} md={12}>
              <Card>
                <CardHeader
                  title="+trace"
                  subheader="trace from root nameservers"
                  titleTypographyProps={{ align: 'center' }}
                  subheaderTypographyProps={{ align: 'center' }}
                  style={{
                    backgroundColor: (theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700])
                  }}
                  className={classes.cardHeader}
                />
                <CardContent>
                  {trace !== "" ? <pre>{trace}</pre> :
                    <div className={classes.cardPricing}>
                      <Skeleton variant="text" width={"100%"} height={"3em"} />
                      <Skeleton variant="text" width={"100%"} height={"3em"} />
                      <Skeleton variant="text" width={"100%"} height={"3em"} />
                    </div>
                  }
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
