import alt from '../alt';
import externalActions from '../actions/externalActions';


class externalStore {
    constructor() {
        this.bindActions(externalActions);

        this.errors = {};

        this.license = false;
        this.contributors = false;
        this.version = false;

    }


    onGotLicense(license) {
        this.setState({
            license: license
        });
    }

    onGotContributors(contributors) {
        this.setState({
            contributors: contributors
        });
    }

    onGotVersion(version) {
        this.setState({
            version: version
        });
    }

    errors({
        errors
    }) {
        this.setState({
            errors
        });
    }

}

export
default alt.createStore(externalStore);
