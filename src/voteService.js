import { getCaptcha } from "./utils";

export class VoteService {
    constructor() {
		this.data = {};
		window.doVote = (placeID) => window.voteService.doVote(placeID);
    }

    fetchMyVotes() {
		fetch('/app/myvotes',
		{
			method: 'GET',
			cache: 'no-cache'
		})
		.then(response => {
			return response.json()
		})
		.then(data => {
			console.log("fetch my votes");
            window.myvotes = data;
		})
		.catch(e => {
			console.log("ploblem fetching votes " + e)
		});
	}

	doVote(placeID) {
		window.placeID = placeID;
				
		window.facebookService.loginIfNeeded()
			.then(() => {
				const btnLike = document.getElementById("btnLike");
				let doUpvote = true;
				if(btnLike.classList.contains('btn-success')) {
					doUpvote = false;
				}
							
				if(doUpvote) {
					btnLike.classList.remove('btn-outline-success');
					btnLike.classList.add('btn-success');
				} else {
					btnLike.classList.add('btn-outline-success');
					btnLike.classList.remove('btn-success');
				}

				window.voteService.vote(
					window.placeID,
					doUpvote,
					(data) => {
						let voteCountElement = document.getElementById("voteCount");
						let voteCount = data.votes;
						if(voteCount < 1) {
							voteCount = "";
						}
						voteCountElement.innerHTML = voteCount;
						window.myvotes[window.placeID] = doUpvote;
						window.votes[window.placeID] = data.votes;
					},
					(jXHR, textStatus, errorThrown) => {
						alert("Error while saving vote: "+ errorThrown);
					});

			});

	}

	vote(placeID, isUpvote, onSuccess, onError) {	
		getCaptcha().then(captcha => {		
			$.ajax({
					url : "/app/vote",
					type: "POST",
					processData: false,
					crossDomain: true,
					headers: { 'x-captcha': captcha },
					data: "place="+ placeID + "&isUpvote=" + isUpvote,
					success: (data) => {
						onSuccess(data);
					},
					error: onError
				});
		});
		

	}
		
	toggleVoteButton() {
		/*let voteCountElement = document.getElementById("voteCount");
		voteCount = voteCountElement.getAttribute("voteCount");
		const voteCountInt = Number.parseInt(voteCount);

		if(isUpvote) {
			voteCountElement.innerHTML = voteCountInt + 1;
		} else {
			voteCountElement.innerHTML = voteCountInt - 1;
		}*/

		btnLike.classList.toggle('btn-outline-success');
		btnLike.classList.toggle('btn-success');
	}


}